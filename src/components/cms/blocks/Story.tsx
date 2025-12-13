import "server-only"
import type { StoryBlock } from "@/types/blocks"
import { cn } from "@/lib/utils"

const containerBySpacing = (spacing?: StoryBlock["spacing"]) => {
  switch (spacing?.container) {
    case "xs":
      return "max-w-xl"
    case "sm":
      return "max-w-3xl"
    case "md":
      return "max-w-5xl"
    case "lg":
      return "max-w-6xl"
    case "xl":
      return "max-w-7xl"
    case "full":
      return "max-w-none"
    default:
      return "max-w-6xl"
  }
}

const CTA_VARIANT: Record<string, string> = {
  outline: "border border-current text-current hover:bg-current/10",
  primary: "bg-gray-900 text-white hover:bg-gray-800 border border-transparent",
  secondary: "bg-white text-gray-900 border border-gray-200 hover:border-gray-300",
  ghost: "text-gray-900 hover:text-gray-600",
}

export default function StoryBlockSection(block: StoryBlock) {
  const heading =
    typeof (block.heading as any) === "string"
      ? { title: block.heading as string, subtitle: block.subheading }
      : {
          ...block.heading,
          subtitle: block.heading?.subtitle ?? block.subheading,
        }
  const layout = block.layout ?? (block.reverse ? "image-right" : "image-left")
  const mediaImages = block.images && block.images.length > 0 ? block.images : block.image ? [block.image] : []
  const showImage = mediaImages.length > 0
  const sectionPaddingY = block.spacing?.paddingY ?? "py-16"
  const sectionPaddingX = block.spacing?.paddingX ?? "px-4 sm:px-6 lg:px-8"
  const containerWidth = containerBySpacing(block.spacing)

  return (
    <section
      id={block.id}
      className={cn(
        block.theme?.background ?? "bg-white",
        block.theme?.text ?? "text-stone-900",
        "relative overflow-hidden",
        sectionPaddingY,
        sectionPaddingX,
        block.className,
      )}
      data-block-type="story"
    >
      <div
        className={cn(
          "mx-auto grid gap-8 items-center",
          containerWidth,
          layout === "stacked" ? "grid-cols-1" : "md:grid-cols-2",
        )}
      >
        <div
          className={cn(
            "space-y-5",
            layout === "image-right" ? "md:order-1" : "",
            layout === "stacked" && "order-2",
          )}
        >
          {heading?.eyebrow && (
            <span className="text-sm uppercase tracking-[0.35em] text-neutral-500">
              {heading.eyebrow}
            </span>
          )}
          {heading?.title && (
            <h2 className="text-2xl md:text-4xl font-extrabold leading-tight">
              {heading.title}
            </h2>
          )}
          {heading?.subtitle && (
            <p className="text-base text-neutral-600">{heading.subtitle}</p>
          )}
          {Array.isArray(block.body)
            ? block.body.map((paragraph, idx) => (
                <p key={idx} className="text-lg leading-8 text-neutral-700">
                  {paragraph}
                </p>
              ))
            : block.body && (
                <p className="text-lg leading-8 text-neutral-700">{block.body}</p>
              )}

          {block.ctas && block.ctas.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-3">
              {block.ctas.map((cta) => (
                <a
                  key={`${cta.text}-${cta.href}`}
                  href={cta.href}
                  target={cta.newTab ? "_blank" : "_self"}
                  rel={cta.newTab ? "noreferrer" : undefined}
                  className={cn(
                    "inline-flex rounded-full px-5 py-2.5 text-sm font-semibold transition shadow-sm",
                    CTA_VARIANT[cta.variant ?? "primary"],
                  )}
                >
                  {cta.text}
                </a>
              ))}
            </div>
          )}

          {block.links && block.links.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-4 text-sm text-neutral-700">
              {block.links.map((link) => (
                <a key={link.href} href={link.href} className="underline hover:text-neutral-900">
                  {link.label}
                </a>
              ))}
            </div>
          )}
        </div>

        {showImage && (
          <div
            className={cn(
              "grid gap-4",
              mediaImages.length > 1 ? "grid-cols-2" : "",
              layout === "image-right" ? "md:order-2" : "",
              layout === "stacked" && "order-1",
            )}
          >
            {mediaImages.map((image, idx) => (
              <div
                key={`${image.src}-${idx}`}
                className={cn(
                  "relative overflow-hidden rounded-2xl border bg-white",
                  block.theme?.card,
                )}
              >
                <img
                  src={image.src}
                  alt={image.alt ?? ""}
                  className="h-full w-full object-cover"
                  style={{
                    aspectRatio:
                      image.ratio === "portrait"
                        ? "3/4"
                        : image.ratio === "3/4"
                          ? "3/4"
                          : image.ratio === "1/1"
                            ? "1/1"
                            : "4/3",
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {block.theme?.ribbon && (
        <div style={{ backgroundColor: block.theme.ribbon }} className="absolute bottom-0 left-0 h-1 w-full" />
      )}
    </section>
  )
}
