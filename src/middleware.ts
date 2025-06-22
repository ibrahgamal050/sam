import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Cache for subdomains
let subdomainsCache: Set<string> = new Set()
let lastFetchTime = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

// Fetch subdomains from an API route
const fetchSubdomains = async (request: NextRequest): Promise<Set<string>> => {
  const host = request.headers.get("host")
  const protocol = host?.includes("localhost") ? "http" : "https"
  const url = `${protocol}://${host}/api/subdomains`

  try {
    const response = await fetch(url, { headers: { "Cache-Control": "no-cache" } })
    if (!response.ok) throw new Error("Failed to fetch subdomains")
    const subdomains = await response.json()
    return new Set(subdomains)
  } catch (error) {
    console.error("Error fetching subdomains:", error)
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
      ? hostname.replace(`.ibrahimgamal.com`, "")
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
        const subdomains = await fetchSubdomains(request)
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

    // For root domain with any path, rewrite to the dynamic [slug] page
    if (pathname !== "/") {
      // Extract the first segment as the slug
      const slug = pathname.split("/")[1]
      return NextResponse.rewrite(new URL(`/${slug}`, request.url))
    }

    // Root path still shows 404 as per original logic
    if (pathname === "/") {
      return NextResponse.rewrite(new URL("/404", request.url))
    }

    return NextResponse.next()
  }

  // Handle subdomains
  try {
    const subdomains = await getSubdomains(request);
    console.log("✅ List of subdomains from cache/API:", Array.from(subdomains));
    
    console.log("📌 currentHost:", currentHost);
    console.log("📌 pathname:", pathname);
  
    if (subdomains.has(currentHost)) {
      console.log("✅ Subdomain exists:", currentHost);
  
      if (pathname !== "/") {
        const slug = pathname.startsWith("/") ? pathname : `/${pathname}`;
        console.log("➡️ Rewriting to:", `/sites${slug}`);
        return NextResponse.rewrite(new URL(`/sites${slug}`, request.url));
      } else {
        console.log("➡️ Rewriting to:", `/sites`);
        return NextResponse.rewrite(new URL(`/sites`, request.url));
      }
  
    } else {
      console.warn("❌ Subdomain not found:", currentHost);
      return NextResponse.rewrite(new URL("/404", request.url));
    }
  
  } catch (error) {
    console.error("❌ Error checking subdomains:", error);
    return NextResponse.rewrite(new URL("/404", request.url));
  }
}
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public/|images).*)"],
}
