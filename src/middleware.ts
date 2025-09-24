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
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

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
  const protocol = request.nextUrl.protocol || (hostHeader?.includes("localhost") ? "http:" : "https:")
  const requestHost = request.nextUrl.host || hostHeader || rootDomain

  if (!requestHost) {
    throw new Error("Unable to resolve host for domain lookup")
  }

  const shouldUseRootDomain =
    !!rootDomain && requestHost.endsWith(rootDomain) && requestHost !== rootDomain

  const targetHost = shouldUseRootDomain ? rootDomain : requestHost

  return `${protocol}//${targetHost}`
}

const fetchDomainData = async (request: NextRequest): Promise<DomainCacheData> => {
  const origin = resolveApiOrigin(request)
  const url = new URL("/api/subdomains", origin).toString()

  const response = await fetch(url, { headers: { "Cache-Control": "no-cache" } })
  if (!response.ok) throw new Error("Failed to fetch domain data")

  const payload = (await response.json()) as ApiDomainEntry[]
  const rootDomain = normalizeHost(process.env.NEXT_PUBLIC_ROOT_DOMAIN)
  const subdomains = new Set<string>()
  const bySubdomain = new Map<string, DomainEntry>()
  const hostMap = new Map<string, HostMatch>()
  const isDevelopment = process.env.NODE_ENV !== "production"

  for (const record of payload) {
    if (!record?.subdomain) continue

    const subdomain = record.subdomain.trim().toLowerCase()
    subdomains.add(subdomain)

    const canonicalHostKey = normalizeHost(record.canonicalHost)
    const domainAliases: DomainAliasRecord[] = (record.domainAliases ?? [])
      .filter((alias): alias is ApiDomainAlias => Boolean(alias?.host))
      .map((alias) => {
        const matchHost = normalizeHost(alias.host)
        return {
          host: alias.host.trim(),
          matchHost: matchHost ?? "",
          redirectTo: alias.redirectTo?.trim() ?? null,
          active: alias.active !== false,
        }
      })
      .filter((alias) => alias.matchHost.length > 0)

    const normalizedRecord: DomainEntry = {
      subdomain,
      canonicalHost: record.canonicalHost?.trim().toLowerCase() ?? null,
      canonicalHostKey,
      domainAliases,
    }

    bySubdomain.set(subdomain, normalizedRecord)

    if (canonicalHostKey) {
      hostMap.set(canonicalHostKey, { record: normalizedRecord, source: "canonical" })
    }

    if (rootDomain) {
      hostMap.set(`${subdomain}.${rootDomain}`, { record: normalizedRecord, source: "platform" })
    }

    if (isDevelopment) {
      hostMap.set(`${subdomain}.localhost`, { record: normalizedRecord, source: "platform" })
    }

    for (const alias of domainAliases) {
      if (!alias.active) continue
      hostMap.set(alias.matchHost, { record: normalizedRecord, alias, source: "alias" })
    }
  }

  return { rootDomain, subdomains, bySubdomain, hostMap }
}

const getDomainData = async (request: NextRequest): Promise<DomainCacheData> => {
  const now = Date.now()
  if (!domainCache || now - lastFetchTime > CACHE_DURATION) {
    try {
      domainCache = await fetchDomainData(request)
      lastFetchTime = now
    } catch (error) {
      console.error("Error updating domain cache:", error)
      if (!domainCache) {
        throw error
      }
    }
  }

  return domainCache
}

const buildPlatformHost = (subdomain: string, originalHost: string, rootDomain: string | null) => {
  const { host, port } = splitHostAndPort(originalHost)
  const isLocal = host === "localhost" || host === "127.0.0.1"

  if (isLocal) {
    const targetHost = `${subdomain}.localhost`
    return port ? `${targetHost}:${port}` : targetHost
  }

  if (rootDomain) {
    return `${subdomain}.${rootDomain}`
  }

  const targetHost = `${subdomain}.${host}`
  return port ? `${targetHost}:${port}` : targetHost
}

const withProtocol = (target: string, fallbackProtocol: string) => {
  if (/^https?:\/\//i.test(target)) {
    return target
  }
  return `${fallbackProtocol}//${target}`
}

export async function middleware(request: NextRequest) {
  const url = request.nextUrl
  const { pathname, search } = url
  const hostnameHeader = request.headers.get("host") || "localhost:3000"
  const hostWithoutPort = stripPort(hostnameHeader)
  const protocol = url.protocol || (hostnameHeader.includes("localhost") ? "http:" : "https:")

  // Redirect www to non-www
  if (hostnameHeader.startsWith("www.")) {
    const targetHost = hostnameHeader.replace(/^www\./, "")
    const redirectUrl = `${protocol}//${targetHost}${pathname}${search}`
    return NextResponse.redirect(redirectUrl, 301)
  }

  // Allow access to API routes, robots.txt, and sitemap for all domains
  if (pathname.startsWith("/api") || pathname.startsWith("/_next") || pathname.includes(".txt")) {
    return NextResponse.next()
  }

  const isXmlRequest = pathname.endsWith(".xml")
  const rootDomainEnv = normalizeHost(process.env.NEXT_PUBLIC_ROOT_DOMAIN)
  const isRootHost =
    hostWithoutPort === "localhost" ||
    hostWithoutPort === "127.0.0.1" ||
    (rootDomainEnv ? hostWithoutPort === rootDomainEnv : false)

  if (isXmlRequest && isRootHost) {
    return NextResponse.next()
  }

  // Special handling for admin/auth routes - always allow
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/auth")) {
    return NextResponse.next()
  }

  let domainData: DomainCacheData
  try {
    domainData = await getDomainData(request)
  } catch (error) {
    console.error("❌ Failed to resolve domain data:", error)
    return NextResponse.rewrite(new URL("/404", request.url))
  }

  if (isRootHost) {
    const pathSegments = pathname.split("/").filter(Boolean)

    if (pathSegments.length > 0) {
      const potentialSubdomain = pathSegments[0].toLowerCase()
      const record = domainData.bySubdomain.get(potentialSubdomain)

      if (record) {
        const restOfPath = pathSegments.slice(1).join("/")
        const redirectHost = record.canonicalHost || buildPlatformHost(potentialSubdomain, hostnameHeader, domainData.rootDomain)
        const redirectPath = restOfPath ? `/${restOfPath}` : "/"
        const redirectUrl = `${protocol}//${redirectHost}${redirectPath}${search}`
        return NextResponse.redirect(redirectUrl, 302)
      }
    }

    if (pathname === "/") {
      return NextResponse.next()
    }

    const slug = pathname.split("/")[1]
    return NextResponse.rewrite(new URL(`/${slug}`, request.url))
  }

  const hostMatch = domainData.hostMap.get(hostWithoutPort)

  if (hostMatch) {
    if (hostMatch.alias?.redirectTo) {
      const redirectUrl = withProtocol(hostMatch.alias.redirectTo, protocol) + `${pathname}${search}`
      return NextResponse.redirect(redirectUrl, 301)
    }

    if (pathname !== "/") {
      const slug = pathname.startsWith("/") ? pathname : `/${pathname}`
      return NextResponse.rewrite(new URL(`/sites${slug}`, request.url))
    }

    return NextResponse.rewrite(new URL(`/sites`, request.url))
  }

  console.warn("❌ Domain not recognized:", hostWithoutPort)
  return NextResponse.rewrite(new URL("/404", request.url))
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public/|images).*)"],
}
