export const isObjectId = (v?: string) => !!v && /^[0-9a-fA-F]{24}$/.test(v)

export const toNumber = (v: unknown, fb = 0) => {
  const n = Number(v)
  return Number.isFinite(n) ? n : fb
}

export const formatMoney = (n: number) => `${Math.max(0, Math.round(n)).toFixed(0)} ج.م`

export async function safeJson(res: Response) {
  try {
    return await res.json()
  } catch {
    return null
  }
}

export const phoneIsValid = (phone: string) => /^\+?\d{7,15}$/.test(phone || '')
