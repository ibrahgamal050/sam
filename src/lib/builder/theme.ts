// src/lib/builder/theme.ts
import type { CSSProperties } from "react"
import type { BuilderTheme, BuilderRenderOptions, ElementBase } from "./types"

export const hasThemeValues = (theme?: BuilderTheme): boolean => {
  if (!theme) return false
  return Boolean(
    (theme.palette && Object.keys(theme.palette).length) ||
      (theme.typography && Object.keys(theme.typography).length) ||
      (theme.radii && Object.keys(theme.radii).length) ||
      (theme.shadows && Object.keys(theme.shadows).length),
  )
}

export const mergeThemes = (...themes: Array<BuilderTheme | undefined>): BuilderTheme | undefined => {
  const merged: BuilderTheme = {}
  for (const theme of themes) {
    if (!theme) continue
    if (theme.palette) {
      merged.palette = { ...merged.palette, ...theme.palette }
    }
    if (theme.typography) {
      merged.typography = { ...merged.typography, ...theme.typography }
    }
    if (theme.radii) {
      merged.radii = { ...merged.radii, ...theme.radii }
    }
    if (theme.shadows) {
      merged.shadows = { ...merged.shadows, ...theme.shadows }
    }
  }
  return hasThemeValues(merged) ? merged : undefined
}

export const themeToCssVariables = (theme?: BuilderTheme): CSSProperties => {
  if (!theme) return {}
  const vars: Record<string, string> = {}
  if (theme.palette?.primary) vars["--builder-primary"] = theme.palette.primary
  if (theme.palette?.secondary) vars["--builder-secondary"] = theme.palette.secondary
  if (theme.palette?.accent) vars["--builder-accent"] = theme.palette.accent
  if (theme.palette?.text) vars["--builder-text"] = theme.palette.text
  if (theme.palette?.muted) vars["--builder-muted"] = theme.palette.muted
  if (theme.palette?.background) vars["--builder-background"] = theme.palette.background

  if (theme.typography?.heading) vars["--builder-heading-font"] = theme.typography.heading
  if (theme.typography?.body) vars["--builder-body-font"] = theme.typography.body

  if (theme.radii?.large) vars["--builder-radius-lg"] = theme.radii.large
  if (theme.radii?.medium) vars["--builder-radius-md"] = theme.radii.medium
  if (theme.radii?.small) vars["--builder-radius-sm"] = theme.radii.small

  if (theme.shadows?.soft) vars["--builder-shadow-soft"] = theme.shadows.soft
  if (theme.shadows?.bold) vars["--builder-shadow-bold"] = theme.shadows.bold

  return vars as CSSProperties
}

export const getElementContext = (
  element: ElementBase,
  options: BuilderRenderOptions,
): BuilderRenderOptions => {
  if (!element.theme) return options
  const mergedTheme = mergeThemes(options.theme, element.theme)
  if (!mergedTheme) return options
  return { ...options, theme: mergedTheme }
}
