import "server-only"
import { cookies, headers } from "next/headers"
import { jwtVerify, createRemoteJWKSet, type JWTPayload } from "jose"

type SessionStatus = "authenticated" | "unauthenticated"

export type SessionUser = {
  id: string
  email?: string
  name?: string
  picture?: string
  email_verified?: boolean
}

export type Session =
  | { status: "unauthenticated" }
  | { status: "authenticated"; user: SessionUser }

const ISSUER = process.env.NEXT_PUBLIC_ISSUER_URL // عادي تكون public
const AUDIENCE = process.env.JWT_AUDIENCE ?? "meelza-clients"
const COOKIE_NAME = process.env.JWT_COOKIE_NAME ?? "mz.access"

async function verifyWithSecret(token: string): Promise<JWTPayload> {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error("JWT_SECRET is not set")
  const key = new TextEncoder().encode(secret)
  const { payload } = await jwtVerify(token, key, {
    issuer: ISSUER,
    audience: AUDIENCE,
    clockTolerance: 5, // ثواني
  })
  return payload
}

async function verifyWithJWKS(token: string): Promise<JWTPayload> {
  const jwksUrl = process.env.JWT_JWKS_URL
  if (!jwksUrl) throw new Error("JWT_JWKS_URL is not set")
  const JWKS = createRemoteJWKSet(new URL(jwksUrl))
  const { payload } = await jwtVerify(token, JWKS, {
    issuer: ISSUER,
    audience: AUDIENCE,
    clockTolerance: 5,
  })
  return payload
}

export async function getSession(): Promise<Session> {
  try {
    const cookieStore = await cookies()
    const headerList = await headers()

    const authToken = headerList.get("authorization")
    const bearerToken = authToken?.startsWith("Bearer ") ? authToken.slice(7) : undefined

    const token = cookieStore.get(COOKIE_NAME)?.value ?? bearerToken

    if (!token) return { status: "unauthenticated" }

    const payload =
      process.env.JWT_JWKS_URL ? await verifyWithJWKS(token) : await verifyWithSecret(token)

    const user: SessionUser = {
      id: String(payload.sub ?? payload.user_id ?? payload.uid ?? ""),
      email: payload.email as string | undefined,
      name: payload.name as string | undefined,
      picture: payload.picture as string | undefined,
      email_verified: Boolean(payload.email_verified),
    }

    if (!user.id) return { status: "unauthenticated" }
    return { status: "authenticated", user }
  } catch (e) {
    console.error("[session] verify failed:", e)
    return { status: "unauthenticated" }
  }
}

/** Helper صارم: يرجّع user أو null (مفيد للصفحات) */
export async function getServerUser(): Promise<SessionUser | null> {
  const s = await getSession()
  return s.status === "authenticated" ? s.user : null
}

/** Helper API: يرمي 401 بسهولة لو مفيش سيشن */
export async function requireServerUser(): Promise<SessionUser> {
  const u = await getServerUser()
  if (!u) {
    throw Object.assign(new Error("Unauthorized"), { status: 401 })
  }
  return u
}
