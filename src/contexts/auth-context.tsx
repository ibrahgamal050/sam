'use client'
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

type AuthUser = {
  sub: string; email?: string; name?: string; picture?: string; email_verified?: boolean
}
type AuthState =
  | { status: 'loading' }
  | { status: 'authenticated'; user: AuthUser }
  | { status: 'unauthenticated' }

const AuthCtx = createContext<AuthState>({ status: 'loading' })

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ status: 'loading' })

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/auth/session', { cache: 'no-store' })
        const data = await res.json()
        if (cancelled) return
        setState(data.status === 'authenticated' ? { status: 'authenticated', user: data.user } : { status: 'unauthenticated' })
      } catch {
        if (!cancelled) setState({ status: 'unauthenticated' })
      }
    })()
    return () => { cancelled = true }
  }, [])

  return <AuthCtx.Provider value={state}>{children}</AuthCtx.Provider>
}

export function useAuth() {
  return useContext(AuthCtx)
}
