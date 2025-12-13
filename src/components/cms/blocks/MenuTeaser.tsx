import "server-only"
import type { MenuTeaserBlock, HeadingContent } from "@/types/blocks"
import { cn } from "@/lib/utils"

const coerceHeading = (heading?: MenuTeaserBlock["heading"]): HeadingContent | undefined => {
  if (!heading) return undefined
  if (typeof heading === "string") return { title: heading }
  return heading
}

const containerBySpacing = (spacing?: MenuTeaserBlock["spacing"]) => {
  switch (spacing?.container) {
    case "xs":
      return "max-w-3xl"
    case "sm":
      return "max-w-4xl"
    case "md":
      return "max-w-5xl"
    case "lg":
    case "xl":
      return "max-w-6xl"
    case "full":
      return "max-w-none"
    default:
      return "max-w-6xl"
  }
}

export default function MenuTeaser(block: MenuTeaserBlock) {
  const heading = coerceHeading(block.heading)
  const items = block.items ?? block.highlightedItems ?? []
  const sectionPaddingY = block.spacing?.paddingY ?? "py-14"
  const sectionPaddingX = block.spacing?.paddingX ?? "px-4 sm:px-6 lg:px-8"
  const highlightStyle = block.highlightStyle ?? "cards"

  return (
    <section
      id={block.id}
      className={cn(
        block.theme?.background ?? "bg-[#fff3e0]",
        block.theme?.text ?? "text-gray-900",
        sectionPaddingY,
        sectionPaddingX,
        block.className,
      )}
      data-block-type="menuTeaser"
    >
      <div className={cn("mx-auto space-y-8", containerBySpacing(block.spacing))}>
        {(heading?.title || heading?.subtitle) && (
          <div>
            {heading?.eyebrow && (
              <span className="text-xs uppercase tracking-[0.35em] text-neutral-500">
                {heading.eyebrow}
              </span>
            )}
            {heading?.title && <h2 className="text-2xl sm:text-3xl font-extrabold">{heading.title}</h2>}
            {heading?.subtitle && (
              <p className="text-sm text-neutral-600 mt-2">{heading.subtitle}</p>
            )}
          </div>
        )}

        <div
          className={cn(
            (highlightStyle === "list" || highlightStyle === "rows")
              ? "space-y-4"
              : "grid gap-6 sm:grid-cols-2 lg:grid-cols-3",
          )}
        >
          {items.map((item) => (
            <article
              key={item.name}
              className={cn(
                "rounded-2xl border bg-white/90 p-5 shadow-sm backdrop-blur",
                highlightStyle === "list" && "flex items-center gap-4",
              )}
            >
              {item.image && (
                <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl">
                  <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                </div>
              )}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold">{item.name}</h3>
                  {item.badge && (
                    <span className="rounded-full bg-black/5 px-3 py-0.5 text-xs font-medium text-black/70">
                      {item.badge}
                    </span>
                  )}
                </div>
                {item.description && (
                  <p className="text-sm text-neutral-600">{item.description}</p>
                )}
                <div className="flex items-center justify-between text-xs text-neutral-500">
                  {item.priceLabel && <span>{item.priceLabel}</span>}
                  {item.ctaLabel && (
                    <a href={item.href ?? "#"} className="font-semibold text-orange-600 underline">
                      {item.ctaLabel}
                    </a>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>

        {block.cta && (
          <div>
            <a
              href={block.cta.href}
              className="inline-flex rounded-full bg-[#c8102e] px-6 py-3 text-sm font-semibold text-white shadow hover:brightness-110"
              style={
                block.cta.style
                  ? {
                      backgroundColor: block.cta.style.bgColor,
                      color: block.cta.style.textColor,
                      borderColor: block.cta.style.borderColor,
                    }
                  : undefined
              }
            >
              {block.cta.text ?? block.cta.label ?? "اكتشف كل القائمة"}
            </a>
          </div>
        )}
      </div>
    </section>
  )
}
