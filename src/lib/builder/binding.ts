// src/lib/builder/binding.ts
import type { BuilderRenderOptions, DataBindingConfig, DataBindingTransform, TextContent, TextSettings } from "./types"

const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

const getValueFromPath = (source: unknown, path?: string): unknown => {
  if (!path) return source
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc === undefined || acc === null) return acc
    if (Array.isArray(acc)) {
      const index = Number(key)
      return Number.isNaN(index) ? undefined : acc[index]
    }
    if (isPlainObject(acc)) {
      return acc[key]
    }
    return undefined
  }, source)
}

const transformText = (value: string, transform?: DataBindingTransform) => {
  if (!transform) return value
  switch (transform) {
    case "uppercase":
      return value.toUpperCase()
    case "lowercase":
      return value.toLowerCase()
    case "capitalize":
      return value.charAt(0).toUpperCase() + value.slice(1)
    case "trim":
      return value.trim()
    default:
      return value
  }
}

const matchesFilter = (record: unknown, filter: Record<string, unknown>) => {
  if (!isPlainObject(record)) return false
  return Object.entries(filter).every(([key, expected]) => record[key] === expected)
}

const resolveBindingValue = (
  binding?: DataBindingConfig,
  options?: BuilderRenderOptions,
): unknown => {
  if (!binding?.source) return binding?.fallback
  const dataSources = options?.dataSources
  if (!dataSources) return binding.fallback
  const sourceValue = dataSources[binding.source]
  if (sourceValue === undefined || sourceValue === null) return binding.fallback

  let value: unknown = sourceValue

  if (binding.filter && Array.isArray(value)) {
    value = value.filter((item) => matchesFilter(item, binding.filter as Record<string, unknown>))
  }

  if (binding.slice && Array.isArray(value)) {
    const offset = binding.slice.offset ?? 0
    const limit = binding.slice.limit ?? value.length
    value = value.slice(offset, limit ? offset + limit : undefined)
  }

  if (binding.pick !== undefined) {
    if (Array.isArray(value) && typeof binding.pick === "number") {
      value = value[binding.pick]
    } else if (isPlainObject(value) && typeof binding.pick === "string") {
      value = value[binding.pick]
    }
  }

  value = getValueFromPath(value, binding.path)

  if (typeof value === "string" && binding.transform) {
    value = transformText(value, binding.transform)
  }

  if ((value === undefined || value === null || value === "") && binding.fallback !== undefined) {
    return binding.fallback
  }

  return value ?? binding?.fallback
}

const toRenderableString = (value: unknown, locale?: string): string | undefined => {
  if (value === undefined || value === null) return undefined
  if (typeof value === "string") return value
  if (typeof value === "number" || typeof value === "boolean") return `${value}`
  if (isPlainObject(value)) {
    const record = value as Record<string, unknown>
    const localized = locale && typeof record[locale] === "string" ? record[locale] : undefined
    if (localized !== undefined) return localized as string
    const arValue = typeof record["ar"] === "string" ? (record["ar"] as string) : undefined
    const enValue = typeof record["en"] === "string" ? (record["en"] as string) : undefined
    return arValue ?? enValue
  }
  return undefined
}

export const resolveTextValue = (text: TextContent, options?: BuilderRenderOptions): string => {
  const bound = text.binding ? toRenderableString(resolveBindingValue(text.binding, options), options?.locale) : undefined
  const fallback = toRenderableString(text.value, options?.locale)
  return bound ?? fallback ?? ""
}

export const normalizeTextContent = (element: { text?: TextContent; value?: string; settings?: TextSettings }): TextContent => {
  const textContent = element.text ?? {
    type: "text",
    value: element.value ?? "",
    settings: element.settings,
  }
  const mergedSettings = textContent.settings ?? element.settings
  return mergedSettings ? { ...textContent, settings: mergedSettings } : textContent
}

export const resolveBoundString = (
  base: string,
  binding: DataBindingConfig | undefined,
  options?: BuilderRenderOptions,
): string => {
  if (!binding) return base
  const resolved = toRenderableString(resolveBindingValue(binding, options), options?.locale)
  return resolved ?? base
}

export {
  isPlainObject,
  getValueFromPath,
  transformText,
  matchesFilter,
  resolveBindingValue,
  toRenderableString,
}
