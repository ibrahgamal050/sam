import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Cache for subdomains
let subdomainsCache: Set<string> = new Set()
let lastFetchTime = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

// Fetch subdomains from an API route
const fetchSubdomains = async (request: NextRequest): Promise<Set<string>> => {
  const explicitBase = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "")
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN
  const hostHeader = request.headers.get("host")

  let origin = explicitBase

  if (!origin) {
    const protocol = request.nextUrl.protocol || (hostHeader?.includes("localhost") ? "http:" : "https:")
    const requestHost = request.nextUrl.host || hostHeader || rootDomain

    if (!requestHost) {
      throw new Error("Unable to resolve host for subdomain lookup")
    }

    const shouldUseRootDomain =
      !!rootDomain && requestHost.endsWith(rootDomain) && requestHost !== rootDomain

    const targetHost = shouldUseRootDomain ? rootDomain : requestHost

    origin = `${protocol}//${targetHost}`
  }

  const url = new URL("/api/subdomains", origin).toString()

  try {
    const response = await fetch(url, { headers: { "Cache-Control": "no-cache" } })
    if (!response.ok) throw new Error("Failed to fetch subdomains")
    const subdomains = await response.json()
    return new Set(subdomains)
  } catch (error) {
    console.error(`Error fetching subdomains from ${url}:`, error)
    throw error
  }
}


// Get subdomains with caching
const getSubdomains = async (request: NextRequest): Promise<Set<string>> => {
  const now = Date.now()
  if (subdomainsCache.size === 0 || now - lastFetchTime > CACHE_DURATION) {
    try {
      subdomainsCache = await fetchSubdomains(request)
      lastFetchTime = now
    } catch (error) {
      console.error("Error updating subdomain cache:", error)
      if (subdomainsCache.size === 0) {
        throw error
      }
    }
  }
  return subdomainsCache
}


export async function middleware(request: NextRequest) {
  const url = request.nextUrl
  const { pathname } = url
  const hostname = request.headers.get("host") || "localhost:3000"
  const currentHost =
    process.env.NODE_ENV === "production" && process.env.VERCEL === "1"
      ? hostname.replace(`.meelza.com`, "")
      : hostname.replace(`.localhost:3000`, "")

  // Redirect www to non-www
  if (hostname.startsWith("www.")) {
    return NextResponse.redirect(`https://${hostname.replace("www.", "")}${url.pathname}`)
  }

  // Allow access to API routes, robots.txt, and sitemap for all domains
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.includes(".xml") ||
    pathname.includes(".txt")
  ) {
    return NextResponse.next()
  }

  // Special handling for admin routes - let them pass through to their specific pages
  if (pathname.startsWith("/dashboard")) {
    return NextResponse.next()
  }
  if (pathname.startsWith("/auth")) {
    return NextResponse.next()
  }

  // Handle root domain
  if (hostname === "localhost:3000" || hostname === process.env.NEXT_PUBLIC_ROOT_DOMAIN) {
    // Check if the first path segment matches a subdomain
    const pathSegments = pathname.split("/").filter(Boolean)
    if (pathSegments.length > 0) {
      try {
        const subdomains = await getSubdomains(request)
        const potentialSubdomain = pathSegments[0]

        if (subdomains.has(potentialSubdomain)) {
          // Redirect to the subdomain with the rest of the path
          const restOfPath = pathSegments.slice(1).join("/")
          const protocol = request.nextUrl.protocol
          const subdomain = `${potentialSubdomain}.${hostname}`
          const redirectUrl = `${protocol}//${subdomain}/${restOfPath}`

          return NextResponse.redirect(redirectUrl)
        } 
      } catch (error) {
        console.error("Error checking path for subdomain:", error)
      }
    }

    if (pathname === "/") {
      return NextResponse.next()
    }

    // For other root domain paths, rewrite to the slug to keep existing dynamic routing
    const slug = pathname.split("/")[1]
    return NextResponse.rewrite(new URL(`/${slug}`, request.url))
  }

  // Handle subdomains
  try {
    const subdomains = await getSubdomains(request)

    if (subdomains.has(currentHost)) {
      if (pathname !== "/") {
        const slug = pathname.startsWith("/") ? pathname : `/${pathname}`
        return NextResponse.rewrite(new URL(`/sites${slug}`, request.url))
      }

      return NextResponse.rewrite(new URL(`/sites`, request.url))
    }

    console.warn("❌ Subdomain not found:", currentHost)
    return NextResponse.rewrite(new URL("/404", request.url))
  } catch (error) {
    console.error("❌ Error checking subdomains:", error)
    return NextResponse.rewrite(new URL("/404", request.url))
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public/|images).*)"],
}
