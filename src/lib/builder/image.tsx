// src/lib/builder/image.tsx
import { Fragment, type CSSProperties } from "react"
import type { BuilderRenderOptions, ImageElement } from "./types"
import { cn } from "@/lib/utils"
import { elementLayoutStyle, elementLayoutClasses } from "./layout"
import { getElementContext, themeToCssVariables } from "./theme"
import { resolveBoundString } from "./binding"

export const renderImageElement = (element: ImageElement, options: BuilderRenderOptions) => {
  const elementContext = getElementContext(element, options)
  const layoutResult = elementLayoutStyle(element.id, element.layout)
  const themeVars = element.theme ? themeToCssVariables(elementContext.theme) : undefined
  const style: CSSProperties = { ...(themeVars ?? {}), ...layoutResult.style }
  if (element.ratio) {
    style.aspectRatio = element.ratio
    style.height = "auto"
  }
  const resolvedSrc = resolveBoundString(element.src, element.srcBinding, elementContext)
  const resolvedAlt = resolveBoundString(element.alt ?? "", element.altBinding, elementContext)

  return (
    <Fragment key={element.id}>
      {layoutResult.css ? (
        <style data-element-style={element.id} dangerouslySetInnerHTML={{ __html: layoutResult.css }} />
      ) : null}
      <figure
        className={cn(
          "w-full",
          element.rounded && "overflow-hidden rounded-3xl",
          element.shadow && "shadow-2xl",
          elementLayoutClasses(element.layout)
        )}
        style={style}
        data-element-id={element.id}
      >
        <img
          src={resolvedSrc}
          alt={resolvedAlt}
          className={cn(
            "h-full w-full",
            element.objectFit ? null : "object-cover",
            element.rounded && "rounded-[inherit]"
          )}
          style={{
            width: element.width ?? "100%",
            height: element.height ?? (element.ratio ? "100%" : undefined),
            objectFit: element.objectFit ?? "cover",
            display: "block",
          }}
        />
      </figure>
    </Fragment>
  )
}
