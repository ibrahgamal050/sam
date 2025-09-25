export type SplitHostResult = {
  host: string
  port: string | null
}

export const splitHostAndPort = (value: string): SplitHostResult => {
  const trimmed = value.trim()
  if (!trimmed) {
    return { host: "", port: null }
  }

  const hasIPv6 = trimmed.startsWith("[") && trimmed.includes("]")
  if (hasIPv6) {
    const closingIndex = trimmed.indexOf("]")
    const hostPart = trimmed.slice(1, closingIndex)
    const portPart = trimmed.slice(closingIndex + 1).replace(/^:/, "")
    return {
      host: hostPart.toLowerCase(),
      port: portPart || null,
    }
  }

  const [hostPart, portPart] = trimmed.split(":")
  return {
    host: (hostPart ?? "").toLowerCase(),
    port: portPart ?? null,
  }
}

export const normalizeHost = (value: string | null | undefined): string => {
  if (!value) return ""
  return splitHostAndPort(value).host
}

export const getRootDomain = (): string | null => {
  const value = process.env.NEXT_PUBLIC_ROOT_DOMAIN?.trim().toLowerCase()
  return value && value.length > 0 ? value : null
}

export const isLocalhost = (host: string): boolean => host === "localhost" || host === "127.0.0.1"

export const extractPlatformSubdomain = (host: string, rootDomain: string | null): string | null => {
  if (!host) return null

  if (host.endsWith(".localhost")) {
    const segments = host.split(".")
    if (segments.length >= 2) {
      return segments.slice(0, -1).join(".")
    }
    return null
  }

  if (rootDomain && host.endsWith(rootDomain)) {
    const hostSegments = host.split(".")
    const rootSegments = rootDomain.split(".")

    if (hostSegments.length > rootSegments.length) {
      return hostSegments.slice(0, hostSegments.length - rootSegments.length).join(".")
    }
  }

  return null
}

export const buildPlatformHost = (
  subdomain: string,
  requestHost: string,
  rootDomain: string | null,
): string => {
  if (!subdomain) return requestHost

  const { host, port } = splitHostAndPort(requestHost)

  if (isLocalhost(host)) {
    const targetHost = `${subdomain}.localhost`
    return port ? `${targetHost}:${port}` : targetHost
  }

  if (rootDomain) {
    return `${subdomain}.${rootDomain}`
  }

  const targetHost = `${subdomain}.${host}`
  return port ? `${targetHost}:${port}` : targetHost
}

export const resolveRestaurantHost = (
  restaurant: { canonicalHost?: string | null; subdomain: string },
  requestHost: string,
  rootDomain: string | null,
): string => {
  if (restaurant.canonicalHost) {
    return restaurant.canonicalHost
  }

  return buildPlatformHost(restaurant.subdomain, requestHost, rootDomain)
}
