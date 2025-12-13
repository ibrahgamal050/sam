import "server-only"
import type { CSSProperties } from "react"
import type { HeadingContent, TextBlock } from "@/types/blocks"
import { cn } from "@/lib/utils"

const SIZE_CLASS: Record<NonNullable<TextBlock["size"]> | "md", string> = {
  sm: "text-base",
  md: "text-lg",
  lg: "text-2xl",
  xl: "text-4xl",
}

const WEIGHT_CLASS: Record<NonNullable<TextBlock["weight"]> | "normal", string> = {
  normal: "font-normal",
  medium: "font-semibold",
  bold: "font-bold",
  extrabold: "font-extrabold",
}

const LINE_HEIGHT: Record<NonNullable<TextBlock["spacingPreset"]> | "normal", string> = {
  tight: "leading-snug",
  normal: "leading-normal",
  wide: "leading-loose",
}

const ALIGN_CLASS: Record<NonNullable<TextBlock["align"]> | "start", string> = {
  start: "text-left",
  center: "text-center",
  end: "text-right",
  justify: "text-justify",
}

const containerBySpacing = (spacing?: TextBlock["spacing"]) => {
  switch (spacing?.container) {
    case "xs":
      return "max-w-xl"
    case "sm":
      return "max-w-2xl"
    case "md":
      return "max-w-3xl"
    case "lg":
      return "max-w-5xl"
    case "xl":
      return "max-w-6xl"
    case "full":
      return "max-w-none"
    default:
      return "max-w-3xl"
  }
}

export default function TextBlockSection(block: TextBlock) {
  const heading =
    typeof (block.heading as any) === "string"
      ? ({ title: block.heading } as HeadingContent)
      : block.heading
  const sectionPaddingY = block.spacing?.paddingY ?? (block as any).padding ?? "py-10"
  const sectionPaddingX = block.spacing?.paddingX ?? "px-4"
  const containerWidth = containerBySpacing(block.spacing)
  const align = ALIGN_CLASS[block.align ?? "start"]
  const sizeClass = SIZE_CLASS[block.size ?? "md"]
  const weight = WEIGHT_CLASS[block.weight ?? "normal"]
  const lineHeight = LINE_HEIGHT[block.spacingPreset ?? "normal"]

  const gradientStyle: CSSProperties | undefined = block.gradient
    ? {
        backgroundImage: `linear-gradient(120deg, ${block.gradient.from ?? "#f97316"}, ${
          block.gradient.to ?? block.gradient.from ?? "#dc2626"
        })`,
        WebkitBackgroundClip: "text",
        color: "transparent",
      }
    : undefined

  return (
    <section
      className={cn(
        block.theme?.background ?? block.background ?? "bg-white",
        block.theme?.text,
        block.theme?.border,
        block.shadow && "shadow-lg",
        block.rounded && "rounded-2xl",
        sectionPaddingY,
        sectionPaddingX,
        block.className,
      )}
      data-block-type="text"
    >
      <div className={cn("mx-auto space-y-4", containerWidth, align)}>
        {heading?.eyebrow && (
          <p className="text-xs uppercase tracking-[0.35em] text-neutral-500">
            {heading.eyebrow}
          </p>
        )}
        {heading?.title && (
          <h2 className="text-2xl font-bold">{heading.title}</h2>
        )}
        {heading?.subtitle && (
          <p className="text-base text-neutral-500">{heading.subtitle}</p>
        )}

        <div
          className={cn(sizeClass, weight, lineHeight, block.color)}
          style={gradientStyle}
          dangerouslySetInnerHTML={{ __html: block.content }}
        />
      </div>
    </section>
  )
}
