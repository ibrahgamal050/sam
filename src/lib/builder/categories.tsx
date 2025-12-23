import { Fragment, type CSSProperties, type ReactNode } from "react"

import { cn } from "@/lib/utils"

import { elementLayoutClasses, elementLayoutStyle } from "./layout"
import { resolveBindingValue, getValueFromPath, toRenderableString } from "./binding"
import type { BuilderRenderOptions, ButtonsElement, Element, ButtonElement } from "./types"

/**
 * Specialized renderer for categories sections composed of a buttons element
 * bound to menu.categories. Keeps mapping + UI in one place.
 */
export const renderCategoriesSection = (element: Element, options: BuilderRenderOptions): ReactNode => {
  if (element.type !== "buttons") return null
  const btnElement = element as ButtonsElement

  const mapBinding =
    btnElement.buttons?.dataBinding?.mode === "map"
      ? btnElement.buttons.dataBinding
      : btnElement.dataBinding?.mode === "map"
        ? btnElement.dataBinding
        : undefined

  const boundValue = mapBinding ? resolveBindingValue(mapBinding, options) : undefined

  const rawItems =
    Array.isArray(boundValue) && mapBinding?.mode === "map"
      ? (() => {
          const labelPath = mapBinding?.map?.labelPath ?? "name"
          const valuePath = mapBinding?.map?.valuePath ?? "slug"
          const hrefTemplate = mapBinding?.map?.hrefTemplate ?? "/menu?tag={slug}"
          const iconPath = mapBinding?.map?.iconPath
          const prepend = mapBinding?.map?.prepend ?? []

          const mapped = boundValue.map((item: any) => {
            const label = toRenderableString(getValueFromPath(item, labelPath), options.locale) ?? ""
            const value = toRenderableString(getValueFromPath(item, valuePath), options.locale) ?? ""
            const icon = iconPath ? toRenderableString(getValueFromPath(item, iconPath), options.locale) : undefined
            const href = hrefTemplate.replace(/\{slug\}/g, value).replace(/\{value\}/g, value)
            return { label, value, href, icon }
          })

          return [...prepend, ...mapped]
        })()
      : btnElement.buttons?.items ?? []

  const currentTagRaw = options.searchParams?.["tag"]
  const currentTag = Array.isArray(currentTagRaw) ? currentTagRaw[0] : currentTagRaw

  const items: ButtonElement[] = rawItems.map((item: any, index: number) => {
    const value = item.value ?? item.slug ?? ""
    const isActive = currentTag ? currentTag === value : !value
    return {
      id: `${element.id}-btn-${index}`,
      type: "button",
      position: index,
      text: { type: "text", value: item.label ?? "" },
      href: item.href ?? "#",
      variant: isActive ? "primary" : "outline",
      iconLeft: item.iconLeft ?? item.icon,
      iconRight: item.iconRight,
      style: item.style,
      hoverStyle: item.hoverStyle,
    }
  })

  const layout = elementLayoutStyle(element.id, element.layout)
  const palette = options.theme?.palette
  const primary = palette?.primary ?? "#0f172a"
  const alignClass =
    btnElement.buttons?.align === "center"
      ? "justify-center"
      : btnElement.buttons?.align === "end"
        ? "justify-end"
        : "justify-start"

  return (
    <Fragment key={element.id}>
      {layout.css ? <style data-element-style={element.id} dangerouslySetInnerHTML={{ __html: layout.css }} /> : null}
      <div
        data-element-id={element.id}
        className={cn(
          "sticky top-0 z-30 flex w-full max-w-full flex-row flex-nowrap items-center gap-2 overflow-x-auto overflow-y-hidden whitespace-nowrap scrollbar-hide -mx-4 px-4",
          elementLayoutClasses(element.layout),
          alignClass,
        )}
        style={{
          ...layout.style,
          overflowX: "auto",
          overflowY: "hidden",
          WebkitOverflowScrolling: "touch",
          msOverflowStyle: "-ms-autohiding-scrollbar",
          background: (layout.style as any)?.background ?? "inherit",
        }}
        role="navigation"
        aria-label="Categories"
      >

        {items.map((btn) => {
          const isPrimary = btn.variant === "primary"
          const bg = (btn.style as any)?.backgroundColor ?? (isPrimary ? primary : "transparent")
          const color = (btn.style as any)?.color ?? (isPrimary ? "#ffffff" : primary)
          const borderColor = (btn.style as any)?.borderColor ?? primary
          const style: CSSProperties = {
            ...(btn.style as CSSProperties),
            backgroundColor: bg,
            color,
            borderColor,
            borderWidth: 1,
            borderStyle: "solid",
          }
          return (
            <a
              key={btn.href}
              href={btn.href}
              className="inline-flex shrink-0 items-center justify-center rounded-full px-4 py-2 text-sm font-bold transition"
              style={style}
            >
              {btn.text?.value ?? btn.label ?? ""}
            </a>
          )
        })}
      </div>
    </Fragment>
  )
}
