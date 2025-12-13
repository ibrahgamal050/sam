import "server-only"
import type { TestimonialsBlock } from "@/types/blocks"
import { cn } from "@/lib/utils"

const containerBySpacing = (spacing?: TestimonialsBlock["spacing"]) => {
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

  const normalizeLayout = (layout?: TestimonialsBlock["layout"]) =>
    layout === "slider" || layout === "strip" ? "carousel" : layout

  const layoutClass = (layout?: TestimonialsBlock["layout"]) => {
    switch (normalizeLayout(layout)) {
      case "grid":
        return "grid md:grid-cols-2 gap-6"
      case "carousel":
        return "flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4"
    case "list":
    default:
      return "space-y-4"
  }
}

export default function Testimonials(block: TestimonialsBlock) {
  const heading =
    typeof (block.heading as any) === "string"
      ? { title: block.heading as string }
      : block.heading
  const sectionPaddingY = block.spacing?.paddingY ?? "py-14"
  const sectionPaddingX = block.spacing?.paddingX ?? "px-4 sm:px-6 lg:px-8"

  return (
    <section
      id={block.id}
      className={cn(
        block.theme?.background ?? "bg-neutral-100",
        block.theme?.text ?? "text-gray-900",
        sectionPaddingY,
        sectionPaddingX,
        block.className,
      )}
      data-block-type="testimonials"
    >
      <div className={cn("mx-auto", containerBySpacing(block.spacing))}>
        {(heading?.title || heading?.subtitle) && (
          <div
            className={cn(
              "mb-8",
              heading?.align === "center"
                ? "text-center"
                : heading?.align === "end"
                  ? "text-right"
                  : "text-left",
            )}
          >
            {heading?.eyebrow && (
              <span className="text-xs uppercase tracking-[0.35em] text-neutral-500">
                {heading.eyebrow}
              </span>
            )}
            {heading?.title && (
              <h2 className="text-2xl sm:text-3xl font-extrabold">{heading.title}</h2>
            )}
            {heading?.subtitle && (
              <p className="text-sm text-neutral-600">{heading.subtitle}</p>
            )}
          </div>
        )}

        {block.ratingSummary && (
          <div className="mb-6 flex flex-wrap items-center gap-4 text-sm text-neutral-600">
            {block.ratingSummary.average && (
              <span className="inline-flex items-center gap-1 font-semibold text-orange-600">
                ⭐ {block.ratingSummary.average.toFixed(1)}
              </span>
            )}
            {block.ratingSummary.totalReviews && (
              <span>{block.ratingSummary.totalReviews}+ تقييم</span>
            )}
            {block.ratingSummary.label && <span>{block.ratingSummary.label}</span>}
          </div>
        )}

        <div className={layoutClass(block.layout)}>
          {block.items.map((item, index) => (
            <article
              key={`${item.quote}-${index}`}
              className={cn(
                "rounded-2xl border bg-white/90 p-6 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/70",
                block.layout === "carousel" && "min-w-[280px] snap-center",
              )}
            >
              {item.rating && (
                <div className="mb-3 flex items-center gap-1 text-amber-500 text-sm">
                  {"★".repeat(Math.round(item.rating)).padEnd(5, "☆")}
                </div>
              )}
              <p className="text-lg leading-7 text-gray-800">“{item.quote}”</p>
              {(item.author || item.role) && (
                <footer className="mt-4 text-sm text-neutral-600">
                  {item.author && <span className="font-semibold">{item.author}</span>}
                  {item.role && <span className="ml-1 text-neutral-500">• {item.role}</span>}
                </footer>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
