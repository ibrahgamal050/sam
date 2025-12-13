// src/lib/builder/button.tsx
import { Fragment, type CSSProperties } from "react"
import type { BuilderRenderOptions, ButtonElement, CtaGroupElement, ButtonVariant, ThemePalette, ResponsiveValue } from "./types"
import { cn } from "@/lib/utils"
import { elementLayoutStyle, elementLayoutClasses, sortByPosition, alignItemsMap, justifyContentMap } from "./layout"
import { getElementContext, themeToCssVariables } from "./theme"
import { normalizeTextContent, resolveBoundString, resolveTextValue } from "./binding"
import { buildResponsiveClasses, hasResponsiveBase, mergeCssRules, resolveResponsiveStyle } from "./responsive"

const buttonVariantClasses: Record<ButtonVariant, string> = {
  primary: "bg-rose-600 text-white hover:bg-rose-500 focus-visible:outline-rose-600",
  secondary: "bg-slate-900 text-white hover:bg-slate-800 focus-visible:outline-slate-900",
  outline: "border border-slate-300 text-slate-900 hover:bg-slate-50 focus-visible:outline-slate-400",
  ghost: "text-slate-700 hover:bg-slate-100 focus-visible:outline-slate-300",
}

const resolveButtonVariantStyle = (
  variant: ButtonVariant,
  palette?: ThemePalette,
): CSSProperties => {
  if (!palette) return {}
  switch (variant) {
    case "primary":
      return {
        backgroundColor: palette.primary,
        color: palette.background ?? "#fff",
        borderColor: palette.primary,
      }
    case "secondary":
      return {
        backgroundColor: palette.secondary ?? palette.text,
        color: palette.background ?? "#fff",
        borderColor: palette.secondary ?? palette.text,
      }
    case "outline":
      return {
        borderColor: palette.primary ?? palette.text,
        color: palette.text ?? palette.primary,
        backgroundColor: "transparent",
      }
    case "ghost":
    default:
      return {
        color: palette.text ?? palette.primary ?? "#0f172a",
        backgroundColor: "transparent",
      }
  }
}

export const renderButtonElement = (
  element: ButtonElement,
  options: BuilderRenderOptions,
) => {
  const elementContext = getElementContext(element, options)
  const layoutResult = elementLayoutStyle(element.id, element.layout)
  const themeVars = element.theme ? themeToCssVariables(elementContext.theme) : undefined
  const resolvedHref = resolveBoundString(element.href, element.hrefBinding, elementContext)
  const variant = element.variant ?? "primary"
  const variantClass = buttonVariantClasses[variant]
  const variantStyle = resolveButtonVariantStyle(variant, elementContext.theme?.palette)
  const style: CSSProperties = { ...(themeVars ?? {}), ...layoutResult.style, ...variantStyle }
  const textContent = normalizeTextContent(element)
  const textValue = resolveTextValue(textContent, elementContext)

  return (
    <Fragment key={element.id}>
      {layoutResult.css ? (
        <style data-element-style={element.id} dangerouslySetInnerHTML={{ __html: layoutResult.css }} />
      ) : null}
      <a
        href={resolvedHref}
        className={cn(
          "inline-flex min-w-[9rem] items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition",
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
          variantClass,
          elementLayoutClasses(element.layout)
        )}
        style={style}
        data-element-id={element.id}
      >
        {element.iconLeft ? (
          <span className="text-lg" aria-hidden="true">
            {element.iconLeft}
          </span>
        ) : null}
        <span dangerouslySetInnerHTML={{ __html: textValue }} />
        {element.iconRight ? (
          <span className="text-lg" aria-hidden="true">
            {element.iconRight}
          </span>
        ) : null}
      </a>
    </Fragment>
  )
}

export const renderCtaGroupElement = (
  element: CtaGroupElement,
  options: BuilderRenderOptions,
) => {
  const elementContext = getElementContext(element, options)
  const layoutResult = elementLayoutStyle(element.id, element.layout)
  const themeVars = element.theme ? themeToCssVariables(elementContext.theme) : undefined
  const alignClasses = buildResponsiveClasses(element.align, (value) => alignItemsMap[value])
  const justifyClasses = buildResponsiveClasses(element.justify, (value) => justifyContentMap[value])
  const gapValue: ResponsiveValue<string> | undefined = element.gap ?? "0.75rem"
  const gapStyle = gapValue
    ? resolveResponsiveStyle(`[data-element-id="${element.id}"]`, "gap", gapValue)
    : undefined
  const style: CSSProperties = { ...(themeVars ?? {}), ...layoutResult.style }
  if (gapStyle?.base !== undefined) {
    style.gap = gapStyle.base
  }
  const css = mergeCssRules(layoutResult.css, gapStyle?.css)
  const buttons = sortByPosition(element.buttons)

  return (
    <Fragment key={element.id}>
      {css ? <style data-element-style={element.id} dangerouslySetInnerHTML={{ __html: css }} /> : null}
      <div
        className={cn(
          "flex flex-wrap",
          alignClasses,
          !hasResponsiveBase(element.align) ? "items-start" : null,
          justifyClasses,
          !hasResponsiveBase(element.justify) ? "justify-start" : null,
          elementLayoutClasses(element.layout)
        )}
        style={style}
        data-element-id={element.id}
      >
        {buttons.map((btn) => renderButtonElement(btn, elementContext))}
      </div>
    </Fragment>
  )
}
