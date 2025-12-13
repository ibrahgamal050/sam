// apps/sites/src/app/auth/signin/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'

export async function GET(req: NextRequest) {
  const issuer = process.env.NEXT_PUBLIC_ISSUER_URL!         // http://localhost:3004
  const client_id = process.env.CLIENT_ID!                   // sites (أو حسب DB)
  const origin = `${req.nextUrl.protocol}//${req.headers.get('host')}`
  const redirect_uri = `${origin}/auth/callback`
  const state = randomUUID()
  const qpReturn = req.nextUrl.searchParams.get('return_url')
  const referer = req.headers.get('referer')
  const cookieReturn = req.cookies.get('mz.return')?.value
  const safeReferer = referer ? resolveSafeReturnUrl(referer, req) : ""
  const rawReturn =
    qpReturn ||        // 1) explicit return_url
    safeReferer ||     // 2) fallback to previous page if same-origin
    cookieReturn ||    // 3) last resort: old cookie
    '/'
  const returnUrl = resolveSafeReturnUrl(rawReturn, req)
  const logoutMarker = req.cookies.get('mz.logout')?.value
  const promptParam = req.nextUrl.searchParams.get('prompt')
  const forceLogin = promptParam === 'login'

  // محاولة صامتة أولًا (prompt=none). لو فيه سِشن في ID هترجع بـ code فورًا.
  const authUrl = new URL(`${issuer}/oauth/authorize`)
  authUrl.searchParams.set('client_id', client_id)
  authUrl.searchParams.set('redirect_uri', redirect_uri)
  authUrl.searchParams.set('response_type', 'code')
  authUrl.searchParams.set('scope', 'openid profile email')
  authUrl.searchParams.set('state', state)
  authUrl.searchParams.set('prompt', logoutMarker || forceLogin ? 'login' : 'none')

  const resp = NextResponse.redirect(authUrl.toString())
  resp.cookies.set('mz.state', state, { httpOnly: true, sameSite: 'lax', path: '/' })
  resp.cookies.set('mz.return', returnUrl, { httpOnly: true, sameSite: 'lax', path: '/' })
  if (logoutMarker) {
    resp.cookies.set('mz.logout', '', { maxAge: 0, path: '/' })
  }
  return resp
}

const resolveSafeReturnUrl = (raw: string, req: NextRequest) => {
  if (!raw) return '/'
  try {
    if (raw.startsWith('/')) {
      return raw.startsWith('//') ? '/' : raw
    }
    const parsed = new URL(raw, req.url)
    if (parsed.origin === req.nextUrl.origin) {
      return parsed.pathname + parsed.search + parsed.hash
    }
  } catch (e) {
    return '/'
  }
  return '/'
}
