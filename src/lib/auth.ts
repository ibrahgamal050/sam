import { getSession as _getSession } from "./auth-server"

export async function getServerSession() {
  const s = await _getSession()
  return s.status === "authenticated" ? { user: s.user } : null
}

export const authOptions = {} as any // dummy للتوافق
