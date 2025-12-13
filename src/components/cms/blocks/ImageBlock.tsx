import "server-only"
import type { PropsWithChildren } from "react"
import type { ImageBlock } from "@/types/blocks"
import { cn } from "@/lib/utils"

const ratioClass = (r?: ImageBlock["ratio"]) => {
  switch (r) {
    case "16/9":
      return "aspect-[16/9]"
    case "4/3":
      return "aspect-[4/3]"
    case "21/9":
      return "aspect-[21/9]"
    case "1/1":
    default:
      return "aspect-square"
  }
}

const containerBySpacing = (spacing?: ImageBlock["spacing"]) => {
  switch (spacing?.container) {
    case "xs":
      return "max-w-xl"
    case "sm":
      return "max-w-2xl"
    case "md":
      return "max-w-4xl"
    case "lg":
      return "max-w-6xl"
    case "xl":
      return "max-w-7xl"
    case "full":
      return "max-w-none"
    default:
      return "max-w-5xl"
  }
}

const LinkWrapper = ({
  block,
  children,
}: PropsWithChildren<{ block: ImageBlock }>) => {
  if (!block.link?.href) return <>{children}</>
  return (
    <a
      href={block.link.href}
      target={block.link.newTab ? "_blank" : "_self"}
      rel={block.link.newTab ? "noreferrer" : undefined}
    >
      {children}
    </a>
  )
}

export default function ImageBlockSection(block: ImageBlock) {
  const sectionPaddingY = block.spacing?.paddingY ?? "py-10"
  const sectionPaddingX = block.spacing?.paddingX ?? "px-4"
  const containerWidth = containerBySpacing(block.spacing)

  return (
    <section
      className={cn(
        block.theme?.background ?? "bg-white",
        block.theme?.text,
        sectionPaddingY,
        sectionPaddingX,
        block.className,
      )}
      data-block-type="image"
    >
      <div
        className={cn(
          "mx-auto",
          containerWidth,
          ratioClass(block.ratio),
          block.shadow && "shadow-lg shadow-black/10",
          block.rounded && "rounded-3xl",
          block.bleed && "max-w-none",
        )}
      >
        <LinkWrapper block={block}>
          <img
            src={block.src}
            alt={block.alt ?? ""}
            className={cn(
              "h-full w-full object-cover",
              block.rounded && "rounded-3xl",
            )}
          />
        </LinkWrapper>
      </div>
      {block.caption && (
        <p className="mt-2 text-sm text-neutral-500 text-center">{block.caption}</p>
      )}
    </section>
  )
}
