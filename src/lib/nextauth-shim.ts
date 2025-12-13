// src/lib/nextauth-shim.ts
'use client'
import { useAuth } from '@/contexts/auth-context'

export function useSession() {
  const auth = useAuth()
  return {
    status: auth.status,                                // 'loading' | 'authenticated' | 'unauthenticated'
    data: auth.status === 'authenticated'
      ? { user: auth.user }                             // حافظ على نفس الشكل المتوقع من next-auth
      : null,
  }
}
