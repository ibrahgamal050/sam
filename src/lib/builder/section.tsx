import { Fragment, type CSSProperties, type ReactNode } from "react"
import type { BuilderRenderOptions, Section, Element, GridElement, MenuDynamicSection } from "./types"
import { cn } from "@/lib/utils"
import type { BranchSummary } from "@/lib/branch-utils"
import {
  containerClassMap,
  sectionLayoutStyle,
  alignItemsMap,
  justifyContentMap,
  gridColsClass,
  sortByPosition,
  elementLayoutStyle,
  elementLayoutClasses,
} from "./layout"
import { getElementContext, mergeThemes, themeToCssVariables } from "./theme"
import { buildResponsiveClasses, hasResponsiveBase, mergeCssRules, resolveResponsiveStyle } from "./responsive"
import { renderTextElement } from "./text"
import { renderImageElement } from "./image"
import { renderButtonElement, renderCtaGroupElement } from "./button"
import {
  renderRowElement,
  renderStackElement,
  renderBoxElement,
  renderColumnsElement,
  renderColumnElement,
  renderGridElement,
} from "./layout-elements"
import { renderMenuDynamic } from "./menu-dynamic"
import {
  renderMenuItemCard,
  renderBranchCard as renderBranchCardElement,
  renderSocialLinks,
  renderRatingBadge,
  renderBadgeElement,
  renderButtonsElement,
  renderTimelineElement,
  renderCardElement,
  renderCarouselElement,
  renderAccordionElement,
} from "./domain-elements"

const normalizeElementShape = (element: Element): Element => {
  if (element.type === "stack" && (element as any).stack) {
    const stack = (element as any).stack
    return {
      ...element,
      gap: stack.gap ?? (element as any).gap,
      align: stack.align ?? (element as any).align,
      children: stack.children ?? (element as any).children,
    }
  }
  if (element.type === "image" && (element as any).image) {
    const img = (element as any).image
    return {
      ...element,
      src: img.src ?? (element as any).src,
      alt: img.alt ?? (element as any).alt,
      ratio: img.ratio ?? (element as any).ratio,
      rounded: img.rounded ?? (element as any).rounded,
      shadow: img.shadow ?? (element as any).shadow,
      width: img.width ?? (element as any).width,
      height: img.height ?? (element as any).height,
      objectFit: img.objectFit ?? (element as any).objectFit,
    }
  }
  if (element.type === "carousel" && (element as any).carousel) {
    const carousel = (element as any).carousel
    return {
      ...element,
      carousel,
    }
  }
  if (element.type === "accordion" && (element as any).accordion) {
    const accordion = (element as any).accordion
    return {
      ...element,
      accordion,
    }
  }
  return element
}

const renderBranchCard = (branch: BranchSummary) => {
  return (
    <div
      key={branch.id || branch.name}
      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/40 transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <h3 className="text-lg font-semibold text-slate-900">{branch.name}</h3>
      {branch.address ? <p className="mt-2 text-sm text-slate-600">{branch.address}</p> : null}
      {branch.city ? <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{branch.city}</p> : null}
      {branch.phone ? (
        <p className="mt-2 text-sm font-medium text-slate-800">
          <span className="text-slate-500">هاتف:</span> {branch.phone}
        </p>
      ) : null}
    </div>
  )
}

export const renderElement = (
  element: Element,
  options: BuilderRenderOptions = {},
): ReactNode => {
  const normalized = normalizeElementShape(element)

  switch (normalized.type) {
    case "text":
      return renderTextElement(normalized, options)
    case "image":
      return renderImageElement(normalized, options)
    case "button":
      return renderButtonElement(normalized, options)
    case "cta-group":
      return renderCtaGroupElement(normalized, options)
    case "row":
      return renderRowElement(normalized, options, renderElement)
    case "stack":
      return renderStackElement(normalized, options, renderElement)
    case "box":
      return renderBoxElement(normalized, options, renderElement)
    case "column":
      return renderColumnElement(normalized, options, renderElement)
    case "columns":
      return renderColumnsElement(normalized, options, renderElement)
    case "grid":
      return renderGridElement(normalized, options, renderElement)
    case "menu-item-card":
      return renderMenuItemCard(normalized, options)
    case "branch-card":
      return renderBranchCardElement(normalized, options)
    case "social-links":
      return renderSocialLinks(normalized, options)
    case "rating-badge":
      return renderRatingBadge(normalized, options)
    case "badge":
      return renderBadgeElement(normalized, options)
    case "buttons":
      return renderButtonsElement(normalized, options)
    case "timeline":
      return renderTimelineElement(normalized, options)
    case "card":
      return renderCardElement(normalized, options)
    case "carousel":
      return renderCarouselElement(normalized, options)
    case "accordion":
      return renderAccordionElement(normalized, options)
    default:
      return null
  }
}

export const renderSection = (
  section: Section,
  options: BuilderRenderOptions = {},
): ReactNode => {
  const layout = section.layout ?? {}
  const isGrid = Boolean(layout.grid)
  const containerClass = containerClassMap[layout.container ?? "full"]
  const baseDisplayClass = isGrid ? "grid" : "flex"
  const directionClasses = !isGrid
    ? buildResponsiveClasses(layout.direction, (value) => (value === "row" ? "flex-row" : "flex-col"))
    : []
  const alignClasses = buildResponsiveClasses(layout.align, (value) => alignItemsMap[value])
  const justifyClasses = buildResponsiveClasses(layout.justify, (value) => justifyContentMap[value])
  const gridColsClasses = layout.grid?.cols
    ? buildResponsiveClasses(layout.grid.cols, (value) => gridColsClass(value))
    : []
  const sectionTheme = mergeThemes(options.theme, section.theme)
  const sectionContext = sectionTheme ? { ...options, theme: sectionTheme } : options
  const activeTheme = sectionContext.theme
  const themeVars = themeToCssVariables(activeTheme)
  const layoutResult = sectionLayoutStyle(section.id, layout)
  const wrapperStyle: CSSProperties = {
    ...themeVars,
    ...layoutResult.style,
  }
  const contentSelector = `[data-section-content="${section.id}"]`
  const gridGapStyle = layout.grid?.gap
    ? resolveResponsiveStyle(contentSelector, "gap", layout.grid.gap)
    : undefined
  const layoutGapStyle = !layout.grid?.gap && layout.gap
    ? resolveResponsiveStyle(contentSelector, "gap", layout.gap)
    : undefined
  const contentStyle: CSSProperties = {}
  if (gridGapStyle?.base !== undefined) {
    contentStyle.gap = gridGapStyle.base
  } else if (layoutGapStyle?.base !== undefined) {
    contentStyle.gap = layoutGapStyle.base
  }
  const contentCss = mergeCssRules(gridGapStyle?.css, gridGapStyle ? undefined : layoutGapStyle?.css)
  const combinedCss = mergeCssRules(layoutResult.css, contentCss)

  const wrapperClasses = cn(
    "w-full",
    layout.rounded && "rounded-[2.5rem]",
    layout.shadow && "shadow-2xl",
    layout.background || layout.gradient ? "overflow-hidden" : null
  )
  const contentClasses = cn(
    containerClass,
    baseDisplayClass,
    directionClasses,
    !isGrid && !hasResponsiveBase(layout.direction) ? "flex-col" : null,
    alignClasses,
    !hasResponsiveBase(layout.align) ? (isGrid ? "items-stretch" : "items-start") : null,
    justifyClasses,
    !hasResponsiveBase(layout.justify) ? "justify-start" : null,
    gridColsClasses,
    layout.grid?.mdCols ? gridColsClass(layout.grid.mdCols, "md") : null,
    layout.grid?.lgCols ? gridColsClass(layout.grid.lgCols, "lg") : null
  )

  if (section.type === "menu-dynamic") {
    return renderMenuDynamic(section as MenuDynamicSection, sectionContext, contentClasses, contentStyle, wrapperClasses, wrapperStyle, combinedCss)
  }

  if (section.type === "branches") {
    const branches = (sectionContext.dataSources?.branches as BranchSummary[] | undefined) ?? []
    const nonGridElements = sortByPosition(section.elements).filter((el) => el.type !== "grid")
    const gridElement = section.elements.find((el) => el.type === "grid") as GridElement | undefined

    const elementContext = gridElement ? getElementContext(gridElement, sectionContext) : sectionContext
    const layoutResult = gridElement ? elementLayoutStyle(gridElement.id, gridElement.layout) : { style: {} as CSSProperties }
    const themeVarsForGrid = gridElement?.theme ? themeToCssVariables(elementContext.theme) : undefined
    const responsiveCols = gridElement?.cols ? buildResponsiveClasses(gridElement.cols, (value) => gridColsClass(value)) : []
    const gapStyle = gridElement?.gap
      ? resolveResponsiveStyle(`[data-element-id="${gridElement.id}"]`, "gap", gridElement.gap)
      : undefined
    const style: CSSProperties = { ...(themeVarsForGrid ?? {}), ...layoutResult.style }
    if (gapStyle?.base !== undefined) style.gap = gapStyle.base
    const css = mergeCssRules(layoutResult.css, gapStyle?.css)

    return (
      <Fragment key={section.id}>
        {combinedCss ? <style data-section-style={section.id} dangerouslySetInnerHTML={{ __html: combinedCss }} /> : null}
        {css ? <style data-element-style={gridElement?.id ?? `${section.id}-branches`} dangerouslySetInnerHTML={{ __html: css }} /> : null}
        <section
          data-section-id={section.id}
          data-section-type={section.type}
          data-section-key={section.key}
          className={wrapperClasses}
          style={wrapperStyle}
        >
          <div className={contentClasses} style={contentStyle} data-section-content={section.id}>
            {nonGridElements.map((element) => renderElement(element, sectionContext))}
            <div
              className={cn(
                "grid w-full",
                responsiveCols.length ? responsiveCols : ["grid-cols-1"],
                gridElement?.mdCols ? gridColsClass(gridElement.mdCols, "md") : null,
                gridElement?.lgCols ? gridColsClass(gridElement.lgCols, "lg") : null,
                gridElement ? elementLayoutClasses(gridElement.layout) : null
              )}
              style={style}
              data-element-id={gridElement?.id ?? `${section.id}-branches`}
            >
              {branches.length
                ? branches.map((branch) => renderBranchCard(branch))
                : (
                  <div className="rounded-xl border border-dashed border-slate-300 bg-white/60 p-6 text-center text-sm text-slate-500">
                    لا توجد فروع متاحة حاليا.
                  </div>
                )}
            </div>
          </div>
        </section>
      </Fragment>
    )
  }

  return (
    <Fragment key={section.id}>
      {combinedCss ? (
        <style data-section-style={section.id} dangerouslySetInnerHTML={{ __html: combinedCss }} />
      ) : null}
      <section
        data-section-id={section.id}
        data-section-type={section.type}
        data-section-key={section.key}
        className={wrapperClasses}
        style={wrapperStyle}
      >
        <div className={contentClasses} style={contentStyle} data-section-content={section.id}>
          {sortByPosition(section.elements).map((element) => renderElement(element, sectionContext))}
        </div>
      </section>
    </Fragment>
  )
}
