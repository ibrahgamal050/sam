import type { IBranch } from "@/types/restaurant"

export interface BranchSummary {
  id: string
  name: string
  address?: string
  city?: string
  phone?: string
  latitude?: number
  longitude?: number
  isMain?: boolean
  distanceKm?: number
}

export const normalizeBranchId = (value: unknown): string => {
  if (typeof value === "string") return value
  if (typeof value === "number" && Number.isFinite(value)) return String(value)
  if (value && typeof value === "object" && "toString" in value) {
    return (value as { toString(): string }).toString()
  }
  return ""
}

const toNumberOrNull = (value: unknown): number | undefined => {
  if (typeof value === "number" && Number.isFinite(value)) return value
  if (typeof value === "string") {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) return parsed
  }
  return undefined
}

export const toBranchSummary = (branch: IBranch | (Partial<IBranch> & { _id?: string | number })) => {
  const id = branch?._id
  const latitude =
    toNumberOrNull((branch as any)?.location?.latitude) ?? toNumberOrNull((branch as any)?.location?.lat)
  const longitude =
    toNumberOrNull((branch as any)?.location?.longitude) ?? toNumberOrNull((branch as any)?.location?.lng)

  return {
    id: normalizeBranchId(id),
    name: (branch as any)?.name?.ar || (branch as any)?.name?.en || "فرع",
    address: (branch as any)?.location?.address?.ar || (branch as any)?.location?.address?.en || "",
    city:
      (branch as any)?.location?.city?.ar ||
      (branch as any)?.location?.city?.en ||
      (branch as any)?.location?.city ||
      "",
    phone: (branch as any)?.phone || "",
    latitude,
    longitude,
    isMain: Boolean((branch as any)?.isMainBranch),
  } satisfies BranchSummary
}

const EARTH_RADIUS_KM = 6371

const haversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const toRad = (value: number) => (value * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const radLat1 = toRad(lat1)
  const radLat2 = toRad(lat2)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(radLat1) * Math.cos(radLat2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return EARTH_RADIUS_KM * c
}

interface FindNearestBranchOptions {
  preferredBranchIds?: Set<string>
}

export const findNearestBranch = (
  branches: Array<IBranch | (Partial<IBranch> & { _id?: string | number })>,
  lat: number,
  lng: number,
  options: FindNearestBranchOptions = {},
): BranchSummary | null => {
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || !branches.length) {
    return null
  }

  const candidates = branches
    .map((branch) => {
      const summary = toBranchSummary(branch)
      if (!summary.id || summary.latitude === undefined || summary.longitude === undefined) {
        return null
      }

      if (options.preferredBranchIds && options.preferredBranchIds.size > 0) {
        const normalizedId = summary.id
        if (!options.preferredBranchIds.has(normalizedId)) {
          return null
        }
      }

      const distanceKm = haversineDistance(lat, lng, summary.latitude!, summary.longitude!)
      return { ...summary, distanceKm }
    })
    .filter((branch): branch is BranchSummary => branch !== null)

  if (!candidates.length) {
    return null
  }

  return candidates.reduce((closest, candidate) => {
    if (!closest) return candidate
    if (candidate.distanceKm === undefined) return closest
    if (closest.distanceKm === undefined || candidate.distanceKm < closest.distanceKm) {
      return candidate
    }
    return closest
  }, candidates[0])
}

export const extractPreferredBranchIdsFromZones = (zones: Array<Record<string, any>> = []) => {
  const ids = new Set<string>()
  zones.forEach((zone) => {
    const candidates = [zone?.branchId, zone?.branch_id, zone?.branch?.id, zone?.branch?._id]
    candidates.forEach((candidate) => {
      const normalized = normalizeBranchId(candidate)
      if (normalized) {
        ids.add(normalized)
      }
    })
  })
  return ids
}

type ClientPoint = {
  type: "Point"
  coordinates: [number, number]
}

interface RankBranchesOptions {
  includeDistance?: boolean
}

export const rankBranchesForClientPoint = (
  clientPoint: ClientPoint,
  zones: Array<Record<string, any>> = [],
  branches: Array<IBranch | (Partial<IBranch> & { _id?: string | number })> = [],
  options: RankBranchesOptions = {},
) => {
  const [lng, lat] = clientPoint.coordinates
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || !branches.length) {
    return []
  }

  const preferredIds = extractPreferredBranchIdsFromZones(zones)

  const scored = branches
    .map((branch) => {
      const summary = toBranchSummary(branch)
      if (summary.latitude == null || summary.longitude == null || !summary.id) {
        return null
      }
      const distanceKm = haversineDistance(lat, lng, summary.latitude, summary.longitude)
      const isPreferred = preferredIds.size === 0 ? false : preferredIds.has(summary.id)
      return {
        branch: summary,
        distanceKm,
        isPreferred,
      }
    })
    .filter((entry): entry is { branch: BranchSummary; distanceKm: number; isPreferred: boolean } => entry !== null)

  if (!scored.length) {
    return []
  }

  scored.sort((a, b) => {
    if (a.isPreferred && !b.isPreferred) return -1
    if (!a.isPreferred && b.isPreferred) return 1
    return a.distanceKm - b.distanceKm
  })

  if (options.includeDistance) {
    return scored.map(({ branch, distanceKm }) => ({ branch, distanceKm }))
  }

  return scored.map(({ branch }) => ({ branch }))
}
