// Shared localization helpers for the Russian (`ru`) experience.
// Safe to import from both server and client components.

export type LocalizedText = {
  ru?: string | null
  en?: string | null
  ar?: string | null
} & Record<string, string | null | undefined>

/**
 * Resolve a localized value with the fallback order ru -> en -> ar -> any -> "".
 * Accepts either a plain string (already localized) or a { ru, en, ar } object.
 */
export const getLocalizedText = (
  value?: LocalizedText | string | null,
  fallback = "",
): string => {
  if (value == null) return fallback
  if (typeof value === "string") return value || fallback

  const resolved =
    value.ru ||
    value.en ||
    value.ar ||
    Object.values(value).find((v) => typeof v === "string" && v.length > 0)

  return resolved || fallback
}
