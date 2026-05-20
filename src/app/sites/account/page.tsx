// apps/sites/src/app/account/page.tsx (HS256 مؤقتًا)
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'

export default async function AccountPage() {
  const cookieStore = await cookies() // ← لازم await
  const token = cookieStore.get('mz.access')?.value
  if (!token) return <main style={{padding:24}}><a href="/auth/signin">تسجيل الدخول</a></main>

  const secret = new TextEncoder().encode(process.env.JWT_SECRET) // نفس السر
  const { payload } = await jwtVerify(token, secret, {
    issuer: process.env.NEXT_PUBLIC_ISSUER_URL || "meelza-sites",
    audience: 'meelza-clients',
  })

  return (
    <main style={{padding:24}}>
      <h1>أهلًا {String(payload.name ?? payload.email ?? 'User')} 👋</h1>
      {payload.picture ? <img src={String(payload.picture)} width={80} height={80} /> : null}
      <p>{String(payload.email ?? '')}</p>
    </main>
  )
}
