import { NextRequest, NextResponse } from 'next/server'

const abs = (path: string, req: NextRequest) => new URL(path, req.url)

export async function GET(req: NextRequest) {
  const returnCookie = req.cookies.get('mz.return')?.value
  const loginPath = abs('/auth/signin', req)
  if (returnCookie) loginPath.searchParams.set('return_url', returnCookie)

  const resp = NextResponse.redirect(loginPath)
  resp.cookies.set('mz.state', '', { maxAge: 0, path: '/' })
  return resp
}
