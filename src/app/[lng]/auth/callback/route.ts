// apps/sites/src/app/auth/callback/route.ts
import { NextRequest, NextResponse } from 'next/server'

const abs = (path: string, req: NextRequest) => new URL(path, req.url)

export async function GET(req: NextRequest) {
  const issuer = process.env.NEXT_PUBLIC_ISSUER_URL!
  const client_id = process.env.CLIENT_ID!

  const url = new URL(req.url)
  const error = url.searchParams.get('error')
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')
  const stateCookie = req.cookies.get('mz.state')?.value
  const returnCookie = req.cookies.get('mz.return')?.value
  const loginPath = abs('/auth/signin', req)

  if (error === 'login_required') {
    const dest = new URL(loginPath)
    dest.searchParams.set('prompt', 'login')
    if (returnCookie) dest.searchParams.set('return_url', returnCookie)
    return NextResponse.redirect(dest)
  }

  if (!state || !stateCookie || state !== stateCookie) {
    return NextResponse.redirect(abs('/auth/error?reason=state_mismatch', req))
  }
  if (!code) {
    return NextResponse.redirect(abs('/auth/error?reason=missing_code', req))
  }

  const origin = `${req.nextUrl.protocol}//${req.headers.get('host')}`
  const redirect_uri = `${origin}/auth/callback`

  // 👇 مهم: استخدم application/x-www-form-urlencoded بدل JSON
  const params = new URLSearchParams()
  params.set('grant_type', 'authorization_code')
  params.set('code', code)
  params.set('client_id', client_id)
  params.set('redirect_uri', redirect_uri)

  const r = await fetch(`${issuer}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  })

  if (!r.ok) {
    const status = r.status
    const detail = await r.text().catch(() => '')
    console.error('token exchange failed', status, detail)
    return NextResponse.redirect(
      abs(`/auth/error?reason=token_exchange_failed&status=${status}&detail=${encodeURIComponent(detail)}`, req)
    )
  }

  const data = await r.json()

  const destination = resolveSafeReturnUrl(returnCookie, req) || '/'
  const resp = NextResponse.redirect(abs(destination, req))
  resp.cookies.set('mz.access', data.access_token, {
    httpOnly: true,
    sameSite: 'lax', // إنتاج: 'none' + Secure مع HTTPS
    path: '/',
    maxAge: data.expires_in ?? 900,
  })
  if (data.refresh_token) {
    resp.cookies.set('mz.refresh', data.refresh_token, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    })
  }
  resp.cookies.set('mz.state', '', { maxAge: 0, path: '/' })
  resp.cookies.set('mz.return', '', { maxAge: 0, path: '/' })
  return resp
}

const resolveSafeReturnUrl = (raw: string | undefined, req: NextRequest) => {
  if (!raw) return ''
  try {
    if (raw.startsWith('/')) {
      return raw.startsWith('//') ? '' : raw
    }
    const parsed = new URL(raw, req.url)
    if (parsed.origin === req.nextUrl.origin) {
      return parsed.pathname + parsed.search + parsed.hash
    }
  } catch (e) {
    return ''
  }
  return ''
}
