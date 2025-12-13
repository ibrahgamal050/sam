// src/lib/builder/layout-elements.tsx
import { Fragment, type CSSProperties, type ReactNode } from "react"
import type {
  BuilderRenderOptions,
  RowElement,
  StackElement,
  BoxElement,
  ColumnsElement,
  ColumnElement,
  GridElement,
  Element,
} from "./types"
import { cn } from "@/lib/utils"
import { elementLayoutStyle, elementLayoutClasses, alignItemsMap, justifyContentMap, gridColsClass, sortByPosition } from "./layout"
import { getElementContext, themeToCssVariables } from "./theme"
import { buildResponsiveClasses, hasResponsiveBase, mergeCssRules, resolveResponsiveStyle } from "./responsive"

type RenderElementFn = (element: Element, options: BuilderRenderOptions) => ReactNode

const renderChildren = (
  children: Element[] | undefined,
  options: BuilderRenderOptions,
  renderElementFn: RenderElementFn,
): ReactNode => {
  if (!children?.length) return null
  return sortByPosition(children).map((child) => renderElementFn(child, options))
}

export const renderRowElement = (
  element: RowElement,
  options: BuilderRenderOptions,
  renderElementFn: RenderElementFn,
): ReactNode => {
  const elementContext = getElementContext(element, options)
  const layoutResult = elementLayoutStyle(element.id, element.layout)
  const themeVars = element.theme ? themeToCssVariables(elementContext.theme) : undefined
  const alignClasses = buildResponsiveClasses(element.align, (value) => alignItemsMap[value])
  const justifyClasses = buildResponsiveClasses(element.justify, (value) => justifyContentMap[value])
  const gapStyle = element.gap
    ? resolveResponsiveStyle(`[data-element-id="${element.id}"]`, "gap", element.gap)
    : undefined
  const style: CSSProperties = { ...(themeVars ?? {}), ...layoutResult.style }
  if (gapStyle?.base !== undefined) {
    style.gap = gapStyle.base
  }
  const css = mergeCssRules(layoutResult.css, gapStyle?.css)

  return (
    <Fragment key={element.id}>
      {css ? <style data-element-style={element.id} dangerouslySetInnerHTML={{ __html: css }} /> : null}
      <div
        className={cn(
          "flex w-full",
          element.wrap && "flex-wrap",
          alignClasses,
          !hasResponsiveBase(element.align) ? "items-stretch" : null,
          justifyClasses,
          !hasResponsiveBase(element.justify) ? "justify-start" : null,
          elementLayoutClasses(element.layout)
        )}
        style={style}
        data-element-id={element.id}
      >
        {renderChildren(element.children, elementContext, renderElementFn)}
      </div>
    </Fragment>
  )
}

export const renderStackElement = (
  element: StackElement,
  options: BuilderRenderOptions,
  renderElementFn: RenderElementFn,
): ReactNode => {
  const elementContext = getElementContext(element, options)
  const layoutResult = elementLayoutStyle(element.id, element.layout)
  const themeVars = element.theme ? themeToCssVariables(elementContext.theme) : undefined
  const alignClasses = buildResponsiveClasses(element.align, (value) => alignItemsMap[value])
  const gapStyle = element.gap
    ? resolveResponsiveStyle(`[data-element-id="${element.id}"]`, "gap", element.gap)
    : undefined
  const style: CSSProperties = { ...(themeVars ?? {}), ...layoutResult.style }
  if (gapStyle?.base !== undefined) style.gap = gapStyle.base
  const css = mergeCssRules(layoutResult.css, gapStyle?.css)

  return (
    <Fragment key={element.id}>
      {css ? <style data-element-style={element.id} dangerouslySetInnerHTML={{ __html: css }} /> : null}
      <div
        className={cn(
          "flex w-full flex-col",
          alignClasses,
          !hasResponsiveBase(element.align) ? "items-stretch" : null,
          elementLayoutClasses(element.layout)
        )}
        style={style}
        data-element-id={element.id}
      >
        {renderChildren(element.children, elementContext, renderElementFn)}
      </div>
    </Fragment>
  )
}

export const renderBoxElement = (
  element: BoxElement,
  options: BuilderRenderOptions,
  renderElementFn: RenderElementFn,
): ReactNode => {
  const elementContext = getElementContext(element, options)
  const layoutResult = elementLayoutStyle(element.id, element.layout)
  const themeVars = element.theme ? themeToCssVariables(elementContext.theme) : undefined
  const directionClasses = buildResponsiveClasses(element.direction, (value) =>
    value === "row" ? "flex-row" : "flex-col",
  )
  const alignClasses = buildResponsiveClasses(element.align, (value) => alignItemsMap[value])
  const justifyClasses = buildResponsiveClasses(element.justify, (value) => justifyContentMap[value])
  const gapStyle = element.gap
    ? resolveResponsiveStyle(`[data-element-id="${element.id}"]`, "gap", element.gap)
    : undefined
  const style: CSSProperties = { ...(themeVars ?? {}), ...layoutResult.style }
  if (gapStyle?.base !== undefined) style.gap = gapStyle.base
  const css = mergeCssRules(layoutResult.css, gapStyle?.css)

  return (
    <Fragment key={element.id}>
      {css ? <style data-element-style={element.id} dangerouslySetInnerHTML={{ __html: css }} /> : null}
      <div
        className={cn(
          "flex w-full",
          directionClasses,
          !hasResponsiveBase(element.direction) ? "flex-col" : null,
          element.wrap && "flex-wrap",
          alignClasses,
          !hasResponsiveBase(element.align) ? "items-stretch" : null,
          justifyClasses,
          !hasResponsiveBase(element.justify) ? "justify-start" : null,
          elementLayoutClasses(element.layout)
        )}
        style={style}
        data-element-id={element.id}
      >
        {renderChildren(element.children, elementContext, renderElementFn)}
      </div>
    </Fragment>
  )
}

export const renderColumnsElement = (
  element: ColumnsElement,
  options: BuilderRenderOptions,
  renderElementFn: RenderElementFn,
): ReactNode => {
  const elementContext = getElementContext(element, options)
  const layoutResult = elementLayoutStyle(element.id, element.layout)
  const themeVars = element.theme ? themeToCssVariables(elementContext.theme) : undefined
  const alignClasses = buildResponsiveClasses(element.align, (value) => alignItemsMap[value])
  const justifyClasses = buildResponsiveClasses(element.justify, (value) => justifyContentMap[value])
  const responsiveCols = element.cols
    ? buildResponsiveClasses(element.cols, (value) => gridColsClass(value))
    : []
  const gapStyle = element.gap
    ? resolveResponsiveStyle(`[data-element-id="${element.id}"]`, "gap", element.gap)
    : undefined
  const style: CSSProperties = { ...(themeVars ?? {}), ...layoutResult.style }
  if (gapStyle?.base !== undefined) style.gap = gapStyle.base
  const css = mergeCssRules(layoutResult.css, gapStyle?.css)
  const stackOnMobile = element.stackOnMobile !== false
  const children = sortByPosition(element.columns ?? element.items)

  return (
    <Fragment key={element.id}>
      {css ? <style data-element-style={element.id} dangerouslySetInnerHTML={{ __html: css }} /> : null}
      {responsiveCols.length ? (
        <div
          className={cn(
            "grid w-full",
            responsiveCols,
            alignClasses,
            !hasResponsiveBase(element.align) ? "items-stretch" : null,
            justifyClasses,
            !hasResponsiveBase(element.justify) ? "justify-start" : null,
            elementLayoutClasses(element.layout)
          )}
          style={style}
          data-element-id={element.id}
        >
          {renderChildren(children, elementContext, renderElementFn)}
        </div>
      ) : (
        <div
          className={cn(
            "w-full",
            "flex",
            stackOnMobile ? "flex-col lg:flex-row" : "flex-row flex-wrap",
            alignClasses,
            !hasResponsiveBase(element.align) ? "items-stretch" : null,
            justifyClasses,
            !hasResponsiveBase(element.justify) ? "justify-start" : null,
            elementLayoutClasses(element.layout)
          )}
          style={style}
          data-element-id={element.id}
        >
          {renderChildren(children, elementContext, renderElementFn)}
        </div>
      )}
    </Fragment>
  )
}

export const renderColumnElement = (
  element: ColumnElement,
  options: BuilderRenderOptions,
  renderElementFn: RenderElementFn,
): ReactNode => {
  const elementContext = getElementContext(element, options)
  const layoutResult = elementLayoutStyle(element.id, element.layout)
  const themeVars = element.theme ? themeToCssVariables(elementContext.theme) : undefined
  const alignClasses = buildResponsiveClasses(element.align, (value) => alignItemsMap[value])
  const justifyClasses = buildResponsiveClasses(element.justify, (value) => justifyContentMap[value])
  const gapStyle = element.gap
    ? resolveResponsiveStyle(`[data-element-id="${element.id}"]`, "gap", element.gap)
    : undefined
  const style: CSSProperties = { ...(themeVars ?? {}), ...layoutResult.style }
  if (gapStyle?.base !== undefined) style.gap = gapStyle.base
  if (element.width) {
    style.width = element.width
  }
  const css = mergeCssRules(layoutResult.css, gapStyle?.css)
  const flexSizing = element.width ? null : "basis-0 grow"

  return (
    <Fragment key={element.id}>
      {css ? <style data-element-style={element.id} dangerouslySetInnerHTML={{ __html: css }} /> : null}
      <div
        className={cn(
          "flex flex-col",
          flexSizing,
          alignClasses,
          !hasResponsiveBase(element.align) ? "items-stretch" : null,
          justifyClasses,
          elementLayoutClasses(element.layout)
        )}
        style={style}
        data-element-id={element.id}
      >
        {renderChildren(element.children, elementContext, renderElementFn)}
      </div>
    </Fragment>
  )
}

export const renderGridElement = (
  element: GridElement,
  options: BuilderRenderOptions,
  renderElementFn: RenderElementFn,
): ReactNode => {
  const elementContext = getElementContext(element, options)
  const layoutResult = elementLayoutStyle(element.id, element.layout)
  const themeVars = element.theme ? themeToCssVariables(elementContext.theme) : undefined
  const responsiveCols = element.cols
    ? buildResponsiveClasses(element.cols, (value) => gridColsClass(value))
    : []
  const gapStyle = element.gap
    ? resolveResponsiveStyle(`[data-element-id="${element.id}"]`, "gap", element.gap)
    : undefined
  const style: CSSProperties = { ...(themeVars ?? {}), ...layoutResult.style }
  if (gapStyle?.base !== undefined) style.gap = gapStyle.base
  const css = mergeCssRules(layoutResult.css, gapStyle?.css)

  return (
    <Fragment key={element.id}>
      {css ? <style data-element-style={element.id} dangerouslySetInnerHTML={{ __html: css }} /> : null}
      <div
        className={cn(
          "grid w-full",
          responsiveCols,
          element.mdCols ? gridColsClass(element.mdCols, "md") : null,
          element.lgCols ? gridColsClass(element.lgCols, "lg") : null,
          elementLayoutClasses(element.layout)
        )}
        style={style}
        data-element-id={element.id}
      >
        {renderChildren(element.children, elementContext, renderElementFn)}
      </div>
    </Fragment>
  )
}
