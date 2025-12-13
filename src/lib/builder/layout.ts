// src/lib/builder/layout.ts
import type { CSSProperties } from "react"
import type { SectionContainer, SectionLayout, ElementLayout, AlignValue, JustifyValue } from "./types"
import { cn } from "@/lib/utils"
import { applyResponsiveStyle } from "./responsive"

export const containerClassMap: Record<SectionContainer, string> = {
  full: "w-full",
  xl: "mx-auto w-full max-w-6xl px-4 sm:px-6",
  lg: "mx-auto w-full max-w-5xl px-4 sm:px-6",
  md: "mx-auto w-full max-w-4xl px-4 sm:px-6",
  sm: "mx-auto w-full max-w-3xl px-4 sm:px-6",
  page: "mx-auto w-full max-w-6xl px-4 sm:px-6",
}

export const alignItemsMap: Record<AlignValue, string> = {
  start: "items-start",
  center: "items-center",
  end: "items-end",
  stretch: "items-stretch",
}

export const justifyContentMap: Record<JustifyValue, string> = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
  between: "justify-between",
}

export const gridColsClass = (count?: number, prefix?: string) => {
  if (!count) return undefined
  const clamped = Math.min(Math.max(count, 1), 6)
  return prefix ? `${prefix}:grid-cols-${clamped}` : `grid-cols-${clamped}`
}

export const gradientBackground = (gradient?: { from?: string; to?: string; angle?: number }) => {
  if (!gradient?.from && !gradient?.to) return undefined
  const from = gradient.from ?? "transparent"
  const to = gradient.to ?? "transparent"
  const angle = gradient.angle ?? 180
  return `linear-gradient(${angle}deg, ${from}, ${to})`
}

type StyleResult = {
  style: CSSProperties
  css?: string
}

export const sectionLayoutStyle = (sectionId: string, layout?: SectionLayout): StyleResult => {
  if (!layout) return { style: {} }
  const selector = `[data-section-id="${sectionId}"]`
  const style: CSSProperties = {}
  const cssRules: string[] = []
  applyResponsiveStyle(selector, style, cssRules, "paddingTop", "padding-top", layout.paddingY)
  applyResponsiveStyle(selector, style, cssRules, "paddingBottom", "padding-bottom", layout.paddingY)
  applyResponsiveStyle(selector, style, cssRules, "paddingLeft", "padding-left", layout.paddingX)
  applyResponsiveStyle(selector, style, cssRules, "paddingRight", "padding-right", layout.paddingX)
  applyResponsiveStyle(selector, style, cssRules, "marginTop", "margin-top", layout.marginTop)
  applyResponsiveStyle(selector, style, cssRules, "marginBottom", "margin-bottom", layout.marginBottom)
  applyResponsiveStyle(selector, style, cssRules, "background", "background", layout.background)

  const gradient = gradientBackground(layout.gradient)
  if (gradient) {
    style.backgroundImage = gradient
  }

  return { style, css: cssRules.length ? cssRules.join("\n") : undefined }
}

export const elementLayoutStyle = (elementId: string, layout?: ElementLayout): StyleResult => {
  if (!layout) return { style: {} }
  const selector = `[data-element-id="${elementId}"]`
  const style: CSSProperties = {}
  const cssRules: string[] = []
  applyResponsiveStyle(selector, style, cssRules, "alignSelf", "align-self", layout.alignSelf)
  applyResponsiveStyle(selector, style, cssRules, "justifySelf", "justify-self", layout.justifySelf)
  applyResponsiveStyle(selector, style, cssRules, "width", "width", layout.width)
  applyResponsiveStyle(selector, style, cssRules, "maxWidth", "max-width", layout.maxWidth)
  applyResponsiveStyle(selector, style, cssRules, "padding", "padding", layout.padding)
  applyResponsiveStyle(selector, style, cssRules, "margin", "margin", layout.margin)
  applyResponsiveStyle(selector, style, cssRules, "order", "order", layout.order)
  applyResponsiveStyle(selector, style, cssRules, "background", "background", layout.background)
  applyResponsiveStyle(selector, style, cssRules, "top", "top", layout.top)
  applyResponsiveStyle(selector, style, cssRules, "right", "right", layout.right)
  applyResponsiveStyle(selector, style, cssRules, "bottom", "bottom", layout.bottom)
  applyResponsiveStyle(selector, style, cssRules, "left", "left", layout.left)
  applyResponsiveStyle(selector, style, cssRules, "zIndex", "z-index", layout.zIndex)

  if (layout.position) {
    style.position = layout.position
  }

  return { style, css: cssRules.length ? cssRules.join("\n") : undefined }
}

export const elementLayoutClasses = (layout?: ElementLayout) =>
  cn(
    layout?.rounded && "rounded-3xl",
    layout?.shadow && "shadow-xl",
    layout?.position === "relative" && "relative",
    layout?.position === "absolute" && "absolute"
  )

export const sortByPosition = <T extends { position?: number }>(items?: T[]): T[] =>
  [...(items ?? [])].map((item, idx) => ({ __idx: idx, ...item })).sort((a, b) => {
    const posA = a.position ?? 0
    const posB = b.position ?? 0
    if (posA === posB) return a.__idx - b.__idx
    return posA - posB
  }).map(({ __idx, ...rest }) => rest as T)
