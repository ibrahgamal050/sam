import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

type ApiDomainAlias = {
  host: string
  redirectTo?: string | null
  active?: boolean
}

type ApiDomainEntry = {
  subdomain: string
  canonicalHost?: string | null
  domainAliases?: ApiDomainAlias[]
}

type DomainAliasRecord = {
  host: string
  matchHost: string
  redirectTo: string | null
  active: boolean
}

type DomainEntry = {
  subdomain: string
  canonicalHost: string | null
  canonicalHostKey: string | null
  domainAliases: DomainAliasRecord[]
}

type HostMatch = {
  record: DomainEntry
  alias?: DomainAliasRecord
  source: "canonical" | "alias" | "platform"
}

type DomainCacheData = {
  rootDomain: string | null
  subdomains: Set<string>
  bySubdomain: Map<string, DomainEntry>
  hostMap: Map<string, HostMatch>
}

let domainCache: DomainCacheData | null = null
let lastFetchTime = 0
const CACHE_DURATION = 5 * 60 * 1000

// ✅ دعم اللغات بدل ar فقط
const SUPPORTED_LOCALES = new Set(["ar", "en", "ru"])

const splitHostAndPort = (hostHeader: string) => {
  const [hostPart, portPart] = hostHeader.split(":")
  return {
    host: hostPart?.toLowerCase() ?? "",
    port: portPart ?? null,
  }
}

const normalizeHost = (host?: string | null) => {
  if (!host) return null
  return splitHostAndPort(host.trim().toLowerCase()).host || null
}

const stripPort = (hostHeader: string) => splitHostAndPort(hostHeader).host

const resolveApiOrigin = (request: NextRequest): string => {
  const explicitBase = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "")
  if (explicitBase) return explicitBase

  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN
  const hostHeader = request.headers.get("host")
  const protocol =
    request.nextUrl.protocol ||
    (hostHeader?.includes("localhost") ? "http:" : "https:")

  const requestHost = request.nextUrl.host || hostHeader || rootDomain

  if (!requestHost) throw new Error("Unable to resolve host")

  const shouldUseRootDomain =
    !!rootDomain && requestHost.endsWith(rootDomain) && requestHost !== rootDomain

  const targetHost = shouldUseRootDomain ? rootDomain : requestHost

  return `${protocol}//${targetHost}`
}

const fetchDomainData = async (request: NextRequest): Promise<DomainCacheData> => {
  const origin = resolveApiOrigin(request)
  const url = new URL("/api/subdomains", origin).toString()

  const response = await fetch(url, { cache: "no-store" })
  if (!response.ok) throw new Error("Failed to fetch domain data")

  const payload = (await response.json()) as ApiDomainEntry[]

  const rootDomain = normalizeHost(process.env.NEXT_PUBLIC_ROOT_DOMAIN)
  const subdomains = new Set<string>()
  const bySubdomain = new Map<string, DomainEntry>()
  const hostMap = new Map<string, HostMatch>()

  const isDevelopment = process.env.NODE_ENV !== "production"

  for (const record of payload) {
    if (!record?.subdomain) continue

    const subdomain = record.subdomain.toLowerCase()
    subdomains.add(subdomain)

    const canonicalHostKey = normalizeHost(record.canonicalHost)

    const domainAliases: DomainAliasRecord[] = (record.domainAliases ?? [])
      .filter((a) => a?.host)
      .map((a) => {
        const matchHost = normalizeHost(a.host)
        return {
          host: a.host.trim(),
          matchHost: matchHost ?? "",
          redirectTo: a.redirectTo?.trim() ?? null,
          active: a.active !== false,
        }
      })
      .filter((a) => a.matchHost)

    const normalized: DomainEntry = {
      subdomain,
      canonicalHost: record.canonicalHost?.toLowerCase() ?? null,
      canonicalHostKey,
      domainAliases,
    }

    bySubdomain.set(subdomain, normalized)

    if (canonicalHostKey) {
      hostMap.set(canonicalHostKey, {
        record: normalized,
        source: "canonical",
      })
    }

    if (rootDomain) {
      hostMap.set(`${subdomain}.${rootDomain}`, {
        record: normalized,
        source: "platform",
      })
    }

    if (isDevelopment) {
      hostMap.set(`${subdomain}.localhost`, {
        record: normalized,
        source: "platform",
      })
    }

    for (const alias of domainAliases) {
      if (!alias.active) continue
      hostMap.set(alias.matchHost, {
        record: normalized,
        alias,
        source: "alias",
      })
    }
  }

  return { rootDomain, subdomains, bySubdomain, hostMap }
}

const getDomainData = async (request: NextRequest) => {
  const now = Date.now()

  if (!domainCache || now - lastFetchTime > CACHE_DURATION) {
    domainCache = await fetchDomainData(request)
    lastFetchTime = now
  }

  return domainCache
}

// ❌ كان ثابت ar
// const SITE_APP_PREFIX = "/sites/ar"

// ✅ أصبح ديناميكي
const SITE_APP_PREFIX = "/sites"

const normalizePath = (value: string) => {
  if (!value || value === "/") return "/"
  return value.startsWith("/") ? value : `/${value}`
}

const ensureSitePath = (value: string): string => {
  const normalized = normalizePath(value)
  const segments = normalized.split("/").filter(Boolean)

  if (segments.length === 0) return "/sites/ar"

  const first = segments[0]?.toLowerCase()
  const locale = SUPPORTED_LOCALES.has(first) ? first : "ar"

  const rest = SUPPORTED_LOCALES.has(first) ? segments.slice(1) : segments
  const restPath = rest.join("/")

  return restPath
    ? `/sites/${locale}/${restPath}`
    : `/sites/${locale}`
}

const buildPlatformHost = (
  subdomain: string,
  originalHost: string,
  rootDomain: string | null
) => {
  const { host, port } = splitHostAndPort(originalHost)
  const isLocal = host === "localhost" || host === "127.0.0.1"

  if (isLocal) {
    const target = `${subdomain}.localhost`
    return port ? `${target}:${port}` : target
  }

  if (rootDomain) return `${subdomain}.${rootDomain}`

  const target = `${subdomain}.${host}`
  return port ? `${target}:${port}` : target
}

export async function middleware(request: NextRequest) {
  const url = request.nextUrl
  const { pathname, search } = url

  const hostHeader = request.headers.get("host") || "localhost:3000"
  const host = stripPort(hostHeader)
  const protocol = url.protocol || "https:"

  // redirect www
  if (hostHeader.startsWith("www.")) {
    const target = hostHeader.replace("www.", "")
    return NextResponse.redirect(
      `${protocol}//${target}${pathname}${search}`,
      301
    )
  }

  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.includes(".txt") ||
    pathname.endsWith(".xml")
  ) {
    return NextResponse.next()
  }

  if (pathname.startsWith("/dashboard") || pathname.startsWith("/auth")) {
    return NextResponse.next()
  }

  const domainData = await getDomainData(request)

  const isRoot =
    host === "localhost" ||
    host === "127.0.0.1" ||
    host === domainData.rootDomain

  // root handling
  if (isRoot) {
    const segments = pathname.split("/").filter(Boolean)

    if (segments.length > 0) {
      const maybeSub = segments[0].toLowerCase()
      const record = domainData.bySubdomain.get(maybeSub)

      if (record) {
        const rest = segments.slice(1).join("/")
        const redirectHost =
          record.canonicalHost ||
          buildPlatformHost(maybeSub, hostHeader, domainData.rootDomain)

        return NextResponse.redirect(
          `${protocol}//${redirectHost}/${rest}${search}`,
          302
        )
      }
    }

    const slug = pathname.split("/")[1]
    return NextResponse.rewrite(new URL(`/${slug}`, request.url))
  }

  const match = domainData.hostMap.get(host)

  if (match) {
    if (match.alias?.redirectTo) {
      return NextResponse.redirect(
        `${protocol}//${match.alias.redirectTo}${pathname}${search}`,
        301
      )
    }

    const rewrite = request.nextUrl.clone()
    rewrite.pathname = ensureSitePath(pathname)
    return NextResponse.rewrite(rewrite)
  }

  return NextResponse.rewrite(new URL("/404", request.url))
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public|images).*)"],
}