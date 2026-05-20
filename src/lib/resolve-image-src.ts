const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "")

const withLeadingSlash = (value: string) => (value.startsWith("/") ? value : `/${value}`)

export const resolveImageSrc = (path?: unknown, fallback = "/placeholder.jpg"): string => {
  if (!path || typeof path !== "string") return fallback

  const trimmedPath = path.trim()
  if (!trimmedPath) return fallback
  if (trimmedPath.startsWith("http://") || trimmedPath.startsWith("https://")) return trimmedPath
  if (trimmedPath.startsWith("/images/")) return trimmedPath

  const normalizedPath = withLeadingSlash(trimmedPath)
  const baseUrl = (process.env.NEXT_PUBLIC_IMAGE_BASE_URL || "").trim()

  return baseUrl ? `${trimTrailingSlash(baseUrl)}${normalizedPath}` : normalizedPath
}
