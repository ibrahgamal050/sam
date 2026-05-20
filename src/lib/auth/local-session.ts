import { SignJWT } from "jose"
import type { NextResponse } from "next/server"

const COOKIE_NAME = process.env.JWT_COOKIE_NAME ?? "mz.access"
const ISSUER = process.env.NEXT_PUBLIC_ISSUER_URL || "meelza-sites"
const AUDIENCE = process.env.JWT_AUDIENCE ?? "meelza-clients"
const MAX_AGE = 60 * 60 * 24 * 30

export type LocalSessionUser = {
  id: string
  email?: string
  name?: string
  picture?: string
}

export async function createLocalAccessToken(user: LocalSessionUser) {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error("JWT_SECRET is not set")

  const payload: Record<string, unknown> = {
    auth_provider: "local",
    email_verified: Boolean(user.email),
  }
  if (user.email) payload.email = user.email
  if (user.name) payload.name = user.name
  if (user.picture) payload.picture = user.picture

  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(new TextEncoder().encode(secret))
}

export function setLocalSessionCookie(response: NextResponse, token: string) {
  response.cookies.set({
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  })
}

export function resolveSafeReturnUrl(raw: string | null | undefined, origin: string) {
  if (!raw) return "/"
  try {
    if (raw.startsWith("/")) return raw.startsWith("//") ? "/" : raw
    const parsed = new URL(raw, origin)
    if (parsed.origin === origin) return parsed.pathname + parsed.search + parsed.hash
  } catch {
    return "/"
  }
  return "/"
}
