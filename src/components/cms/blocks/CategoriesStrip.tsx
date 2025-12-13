import "server-only"
import type { CategoriesStripBlock, HeadingContent } from "@/types/blocks"
import { cn } from "@/lib/utils"

const containerBySpacing = (spacing?: CategoriesStripBlock["spacing"]) => {
  switch (spacing?.container) {
    case "xs":
      return "max-w-4xl"
    case "sm":
      return "max-w-5xl"
    case "md":
      return "max-w-6xl"
    case "lg":
    case "xl":
      return "max-w-7xl"
    case "full":
      return "max-w-none"
    default:
      return "max-w-7xl"
  }
}

const coerceHeading = (heading?: CategoriesStripBlock["heading"]): HeadingContent | undefined => {
  if (!heading) return undefined
  if (typeof heading === "string") return { title: heading }
  return heading
}

export default function CategoriesStrip(block: CategoriesStripBlock) {
  const heading = coerceHeading(block.heading)
  const layout = block.layout ?? "carousel"
  const sectionPaddingY = block.spacing?.paddingY ?? "py-12"
  const sectionPaddingX = block.spacing?.paddingX ?? "px-4 sm:px-6 lg:px-8"
  const container = containerBySpacing(block.spacing)

  return (
    <section
      id={block.id}
      className={cn(
        block.theme?.background ?? "bg-white",
        block.theme?.text ?? "text-gray-900",
        sectionPaddingY,
        sectionPaddingX,
        block.className,
      )}
      data-block-type="categoriesStrip"
    >
      <div className={cn("mx-auto space-y-6", container)}>
        {(heading?.title || heading?.subtitle) && (
          <div
            className={cn(
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
            {heading?.title && <h2 className="text-2xl font-extrabold">{heading.title}</h2>}
            {heading?.subtitle && <p className="text-sm text-neutral-600">{heading.subtitle}</p>}
          </div>
        )}

        {layout === "pills" ? (
          <div className="flex flex-wrap gap-3">
            {block.categories.map((category) => (
              <a
                key={category.id}
                href={category.href || "#"}
                className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold shadow-sm"
                style={{
                  borderColor: category.chipColor ?? undefined,
                  color: category.chipColor ?? undefined,
                }}
              >
                {category.icon && <span aria-hidden>{category.icon}</span>}
                <span>{category.label}</span>
              </a>
            ))}
          </div>
        ) : (
          <div
            className={cn(
              "gap-4",
              layout === "grid"
                ? "grid sm:grid-cols-2 lg:grid-cols-4"
                : "flex snap-x snap-mandatory overflow-x-auto pb-2",
            )}
          >
            {block.categories.map((category) => (
              <a
                key={category.id}
                href={category.href || "#"}
                className={cn(
                  "rounded-2xl border bg-white/90 p-4 shadow-sm transition hover:-translate-y-1 hover:shadow",
                  layout === "carousel" && "min-w-[240px] snap-start",
                )}
              >
                {category.image && (
                  <div className="mb-3 h-32 w-full overflow-hidden rounded-xl">
                    <img
                      src={category.image}
                      alt={category.label}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
                <div className="flex items-center gap-2">
                  {category.icon && (
                    <span className="text-xl" aria-hidden>
                      {category.icon}
                    </span>
                  )}
                  <span className="font-semibold">{category.label}</span>
                </div>
                {category.description && (
                  <p className="mt-2 text-sm text-neutral-600">{category.description}</p>
                )}
                {category.chipColor && (
                  <span
                    className="mt-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold"
                    style={{ backgroundColor: category.chipColor }}
                  >
                    {category.id}
                  </span>
                )}
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
