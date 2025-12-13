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
  link: "bg-transparent text-rose-600 hover:underline underline-offset-4 px-0 py-0",
  "solid-dark": "bg-slate-900 text-white hover:bg-slate-800 focus-visible:outline-slate-900",
  "solid-light": "bg-white text-slate-900 hover:bg-white/90 border border-white focus-visible:outline-white",
  gradient: "text-white bg-gradient-to-r from-rose-600 to-amber-500 shadow-lg shadow-rose-200/60",
  danger: "bg-red-600 text-white hover:bg-red-500 focus-visible:outline-red-600",
  success: "bg-emerald-600 text-white hover:bg-emerald-500 focus-visible:outline-emerald-600",
  order: "bg-amber-500 text-slate-900 hover:bg-amber-400 focus-visible:outline-amber-500 shadow-md shadow-amber-200/60",
  call: "bg-emerald-500 text-white hover:bg-emerald-400 focus-visible:outline-emerald-500",
  map: "bg-sky-500 text-white hover:bg-sky-400 focus-visible:outline-sky-500",
  "add-to-cart": "bg-rose-600 text-white hover:bg-rose-500 focus-visible:outline-rose-600",
  icon: "bg-slate-900 text-white hover:bg-slate-800 focus-visible:outline-slate-900",
  "icon-left": "bg-rose-600 text-white hover:bg-rose-500 focus-visible:outline-rose-600",
  "icon-right": "bg-rose-600 text-white hover:bg-rose-500 focus-visible:outline-rose-600",
  fab: "bg-rose-600 text-white shadow-lg shadow-rose-200/70 hover:bg-rose-500 focus-visible:outline-rose-600",
  loading: "bg-slate-300 text-slate-600 cursor-wait",
  disabled: "bg-slate-200 text-slate-400 cursor-not-allowed",
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
      return {
        color: palette.text ?? palette.primary ?? "#0f172a",
        backgroundColor: "transparent",
      }
    case "link":
      return {
        color: palette.primary ?? palette.text ?? "#0f172a",
        backgroundColor: "transparent",
        borderColor: "transparent",
      }
    case "solid-dark":
      return {
        backgroundColor: palette.text ?? "#0f172a",
        color: palette.background ?? "#fff",
        borderColor: palette.text ?? "#0f172a",
      }
    case "solid-light":
      return {
        backgroundColor: "#fff",
        color: palette.primary ?? palette.text ?? "#0f172a",
        borderColor: "#fff",
      }
    case "gradient":
      return {
        backgroundImage: `linear-gradient(135deg, ${palette.primary ?? "#f43f5e"} 0%, ${palette.accent ?? palette.secondary ?? "#f59e0b"} 100%)`,
        color: palette.background ?? "#fff",
      }
    case "danger":
      return {
        backgroundColor: "#dc2626",
        color: "#fff",
        borderColor: "#dc2626",
      }
    case "success":
      return {
        backgroundColor: "#16a34a",
        color: "#fff",
        borderColor: "#16a34a",
      }
    case "order":
      return {
        backgroundColor: palette.accent ?? palette.primary ?? "#f59e0b",
        color: palette.text ?? "#0f172a",
        borderColor: palette.accent ?? palette.primary ?? "#f59e0b",
      }
    case "call":
      return {
        backgroundColor: palette.success ?? "#10b981",
        color: "#fff",
        borderColor: palette.success ?? "#10b981",
      }
    case "map":
      return {
        backgroundColor: "#0ea5e9",
        color: "#fff",
        borderColor: "#0ea5e9",
      }
    case "add-to-cart":
      return {
        backgroundColor: palette.primary ?? "#f43f5e",
        color: palette.background ?? "#fff",
        borderColor: palette.primary ?? "#f43f5e",
      }
    case "icon":
    case "icon-left":
    case "icon-right":
    case "fab":
      return {
        backgroundColor: palette.primary ?? "#0f172a",
        color: palette.background ?? "#fff",
        borderColor: palette.primary ?? "#0f172a",
      }
    case "loading":
      return {
        backgroundColor: palette.muted ?? "#e2e8f0",
        color: palette.text ?? "#475569",
      }
    case "disabled":
    default:
      return {
        backgroundColor: palette.muted ?? "#e2e8f0",
        color: palette.text ?? "#94a3b8",
        opacity: 0.7,
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
  const isIconOnly = variant === "icon" || variant === "fab"
  const isLoading = element.state === "loading" || element.variant === "loading"
  const isDisabled = element.state === "disabled" || element.variant === "disabled"
  const textContent = normalizeTextContent(element)
  const rawTextValue = resolveTextValue(textContent, elementContext) as unknown
  const textValue = typeof rawTextValue === "string"
    ? rawTextValue
    : typeof rawTextValue === "number" || typeof rawTextValue === "boolean"
      ? String(rawTextValue)
      : ""

  return (
    <Fragment key={element.id}>
      {layoutResult.css ? (
        <style data-element-style={element.id} dangerouslySetInnerHTML={{ __html: layoutResult.css }} />
      ) : null}
      <a
        href={resolvedHref}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-full text-sm font-semibold transition",
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
          isIconOnly ? "h-11 w-11 min-w-[2.75rem] px-0" : "min-w-[9rem] px-6 py-3",
          variant === "fab" ? "fixed bottom-4 right-4 md:right-6 md:bottom-6 shadow-xl" : null,
          variant === "link" ? "min-w-0 px-0 py-0" : "py-3",
          isLoading || isDisabled ? "pointer-events-none opacity-70" : null,
          variantClass,
          elementLayoutClasses(element.layout)
        )}
        style={style}
        data-element-id={element.id}
        aria-disabled={isDisabled || isLoading}
      >
        {element.iconLeft ? (
          <span className="text-lg" aria-hidden="true">
            {element.iconLeft}
          </span>
        ) : null}
        {variant !== "icon" && (
          <span dangerouslySetInnerHTML={{ __html: textValue }} />
        )}
        {element.iconRight ? (
          <span className="text-lg" aria-hidden="true">
            {element.iconRight}
          </span>
        ) : null}
        {isLoading ? <span className="ms-2 h-4 w-4 animate-spin rounded-full border-2 border-white/70 border-r-transparent" aria-hidden /> : null}
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
