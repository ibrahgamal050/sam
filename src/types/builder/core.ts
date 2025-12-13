// types/builder/core.ts
export type Breakpoint = "base" | "sm" | "md" | "lg" | "xl"

export type ResponsiveValue<T> = T | Partial<Record<Breakpoint, T>>

export interface ThemePalette {
  primary?: string
  secondary?: string
  accent?: string
  text?: string
  muted?: string
  background?: string
}

export interface ThemeTypography {
  heading?: string
  body?: string
}

export interface ThemeRadii {
  large?: string
  medium?: string
  small?: string
}

export interface ThemeShadows {
  soft?: string
  bold?: string
}

export interface BuilderTheme {
  palette?: ThemePalette
  typography?: ThemeTypography
  radii?: ThemeRadii
  shadows?: ThemeShadows
}

export type DataBindingSource = "menu" | "branches" | "offers" | "cms" | "custom" | string

export type DataBindingTransform = "uppercase" | "lowercase" | "capitalize" | "trim"
export type DataBindingFormat = "plain" | "html" | "url" | "image"

export interface DataBindingConfig {
  source: DataBindingSource
  path?: string
  pick?: number | string
  filter?: Record<string, unknown>
  slice?: { offset?: number; limit?: number }
  transform?: DataBindingTransform
  format?: DataBindingFormat
  fallback?: string
}

export interface BuilderMeta {
  createdBy?: string
  updatedBy?: string
  tags?: string[]
  notes?: string
  thumbnailUrl?: string
  deviceTargets?: Array<"mobile" | "tablet" | "desktop">
}

export interface BuilderVersionEntry {
  version: number
  notes?: string
  updatedBy?: string
  updatedAt: Date | string
}

export interface BuilderVersioning {
  current: number
  history?: BuilderVersionEntry[]
}

export interface BuilderDataSources {
  menu?: unknown
  branches?: unknown
  offers?: unknown
  cms?: Record<string, unknown>
  [key: string]: unknown
}

export interface BuilderRenderOptions {
  theme?: BuilderTheme
  dataSources?: BuilderDataSources
  locale?: string
}
