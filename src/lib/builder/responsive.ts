// src/lib/builder/responsive.ts
import type { CSSProperties } from "react"
import type { Breakpoint, ResponsiveValue } from "./types"

const breakpointPrefixes: Record<Exclude<Breakpoint, "base">, string> = {
  sm: "sm",
  md: "md",
  lg: "lg",
  xl: "xl",
}

const breakpointMinWidth: Record<Exclude<Breakpoint, "base">, string> = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
}

export const isResponsiveRecord = <T,>(value: ResponsiveValue<T>): value is Partial<Record<Breakpoint, T>> => {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

export const hasResponsiveBase = (value?: ResponsiveValue<unknown>): boolean => {
  if (value === undefined) return false
  if (!isResponsiveRecord(value)) return true
  return value.base !== undefined
}

export const buildResponsiveClasses = <T,>(
  value: ResponsiveValue<T> | undefined,
  resolver: (raw: T) => string | undefined,
): string[] => {
  if (value === undefined) return []
  if (!isResponsiveRecord(value)) {
    const cls = resolver(value as T)
    return cls ? [cls] : []
  }
  const classes: string[] = []
  if (value.base !== undefined) {
    const baseClass = resolver(value.base as T)
    if (baseClass) classes.push(baseClass)
  }
  ;(Object.keys(breakpointPrefixes) as Array<Exclude<Breakpoint, "base">>).forEach((bp) => {
    const bpValue = value[bp]
    if (bpValue === undefined) return
    const cls = resolver(bpValue as T)
    if (!cls) return
    classes.push(`${breakpointPrefixes[bp]}:${cls}`)
  })
  return classes
}

type ResponsiveStyleComputation<T extends string | number> = {
  base?: T
  css?: string
}

const toCssValue = (value: string | number) => (typeof value === "number" ? `${value}` : value)

export const resolveResponsiveStyle = <T extends string | number>(
  selector: string,
  cssProperty: string,
  value?: ResponsiveValue<T>,
): ResponsiveStyleComputation<T> | undefined => {
  if (value === undefined) return undefined
  if (!isResponsiveRecord(value)) {
    return { base: value as T }
  }

  const cssRules: string[] = []
  ;(Object.keys(breakpointMinWidth) as Array<Exclude<Breakpoint, "base">>).forEach((bp) => {
    const bpValue = value[bp]
    if (bpValue === undefined) return
    const minWidth = breakpointMinWidth[bp]
    cssRules.push(`@media (min-width: ${minWidth}) { ${selector} { ${cssProperty}: ${toCssValue(bpValue as string | number)}; } }`)
  })

  return {
    base: value.base as T | undefined,
    css: cssRules.length ? cssRules.join("\n") : undefined,
  }
}

export const applyResponsiveStyle = <T extends string | number>(
  selector: string,
  style: CSSProperties,
  cssRules: string[],
  property: keyof CSSProperties,
  cssProperty: string,
  value?: ResponsiveValue<T>,
) => {
  const resolved = resolveResponsiveStyle(selector, cssProperty, value)
  if (!resolved) return
  if (resolved.base !== undefined) {
    ;(style as any)[property] = resolved.base
  }
  if (resolved.css) cssRules.push(resolved.css)
}

export const mergeCssRules = (...rules: Array<string | undefined>): string | undefined => {
  const filtered = rules.filter(Boolean) as string[]
  return filtered.length ? filtered.join("\n") : undefined
}
