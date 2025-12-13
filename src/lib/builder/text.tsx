// src/lib/builder/text.tsx
import { Fragment, type CSSProperties } from "react"
import type { BuilderRenderOptions, TextElement, TextAlign, TextVariant, TextSize, TextWeight, SpacingPreset } from "./types"
import { cn } from "@/lib/utils"
import { elementLayoutStyle, elementLayoutClasses, gradientBackground } from "./layout"
import { getElementContext, themeToCssVariables } from "./theme"
import { normalizeTextContent, resolveTextValue } from "./binding"

const textAlignClassMap = (dir: "rtl" | "ltr"): Record<TextAlign, string> => {
  const start = dir === "rtl" ? "text-right" : "text-left"
  const end = dir === "rtl" ? "text-left" : "text-right"
  return {
    start,
    center: "text-center",
    end,
    justify: "text-justify",
  }
}

const textVariantClasses: Record<TextVariant, string> = {
  heroHeading: "text-4xl leading-tight font-extrabold md:text-5xl",
  heroSubheading: "text-lg text-slate-600 md:text-xl",
  heroBadge: "text-xs font-semibold uppercase tracking-[0.3em] text-rose-700",
  sectionHeading: "text-2xl md:text-3xl font-extrabold",
  body: "text-base text-slate-700 leading-relaxed",
  button: "text-base font-medium",
}

const textVariantTag: Partial<Record<TextVariant, keyof JSX.IntrinsicElements>> = {
  heroHeading: "h1",
  heroSubheading: "p",
  heroBadge: "p",
  sectionHeading: "h2",
  button: "span",
}

const textSizeClasses: Record<TextSize, string> = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
  xl: "text-2xl md:text-3xl",
}

const textWeightClasses: Record<TextWeight, string> = {
  normal: "font-normal",
  medium: "font-medium",
  bold: "font-bold",
  extrabold: "font-extrabold",
}

const spacingPresetClasses: Record<SpacingPreset, string> = {
  tight: "tracking-tight",
  normal: "tracking-normal",
  wide: "tracking-wide",
}

export const renderTextElement = (
  element: TextElement,
  options: BuilderRenderOptions,
) => {
  const elementContext = getElementContext(element, options)
  const activeTheme = elementContext.theme
  const textContent = normalizeTextContent(element)
  const settings = textContent.settings ?? {}
  const variant = settings.variant ?? "body"
  const Tag = textVariantTag[variant] ?? "p"
  const layoutResult = elementLayoutStyle(element.id, element.layout)
  const alignClasses = settings.align ? textAlignClassMap(options.locale === "ar" ? "rtl" : "ltr")[settings.align] : null
  const className = cn(
    "leading-relaxed",
    textVariantClasses[variant],
    alignClasses,
    settings.size ? textSizeClasses[settings.size] : null,
    settings.weight ? textWeightClasses[settings.weight] : null,
    settings.spacingPreset ? spacingPresetClasses[settings.spacingPreset] : null,
    settings.italic && "italic",
    settings.underline && "underline",
    settings.rounded && "rounded-full px-3 py-1",
    elementLayoutClasses(element.layout)
  )
  const themeVars = element.theme ? themeToCssVariables(elementContext.theme) : undefined
  const style: CSSProperties = {
    ...(themeVars ?? {}),
    ...layoutResult.style,
  }
  if (settings.color) {
    style.color = settings.color
  } else if (activeTheme?.palette?.text) {
    style.color = activeTheme.palette.text
  }
  if (settings.maxWidth) style.maxWidth = settings.maxWidth
  if (settings.lineHeight) style.lineHeight = settings.lineHeight
  if (settings.background) style.background = settings.background
  if (settings.transform && settings.transform !== "none") style.textTransform = settings.transform
  if (settings.shadow) style.textShadow = "0 8px 20px rgb(15 23 42 / 0.15)"
  if (!style.fontFamily) {
    if (variant === "heroHeading" && activeTheme?.typography?.heading) {
      style.fontFamily = activeTheme.typography.heading
    } else if (activeTheme?.typography?.body) {
      style.fontFamily = activeTheme.typography.body
    }
  }
  const gradient = gradientBackground(settings.gradient)
  if (gradient) {
    style.backgroundImage = gradient
    style.WebkitBackgroundClip = "text"
    style.color = "transparent"
  }
  const textValue = resolveTextValue(textContent, elementContext)

  return (
    <Fragment key={element.id}>
      {layoutResult.css ? (
        <style data-element-style={element.id} dangerouslySetInnerHTML={{ __html: layoutResult.css }} />
      ) : null}
      <Tag
        data-element-id={element.id}
        className={className}
        style={style}
        dangerouslySetInnerHTML={{ __html: textValue }}
      />
    </Fragment>
  )
}
