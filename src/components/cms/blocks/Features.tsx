import "server-only"
import type { FeaturesBlock, HeadingContent } from "@/types/blocks"
import { cn } from "@/lib/utils"

const coerceHeading = (heading?: FeaturesBlock["heading"]): HeadingContent | undefined => {
  if (!heading) return undefined
  if (typeof heading === "string") return { title: heading }
  return heading
}

export default function Features(block: FeaturesBlock) {
  const heading = coerceHeading(block.heading)
  const layout = block.layout ?? "icons-row"
  const features = block.features ?? block.items ?? []

  return (
    <section
      id={block.id}
      className={cn(
        block.theme?.background ?? "bg-white",
        block.theme?.text ?? "text-gray-900",
        block.spacing?.paddingY ?? "py-12",
        block.spacing?.paddingX ?? "px-4 sm:px-6 lg:px-8",
        block.className,
      )}
      data-block-type="features"
    >
      <div className="mx-auto max-w-6xl space-y-8">
        {(heading?.title || heading?.subtitle || block.intro) && (
          <div>
            {heading?.eyebrow && (
              <span className="text-xs uppercase tracking-[0.35em] text-neutral-500">
                {heading.eyebrow}
              </span>
            )}
            {heading?.title && (
              <h2 className="text-2xl sm:text-3xl font-extrabold">{heading.title}</h2>
            )}
            {heading?.subtitle && (
              <p className="text-sm text-neutral-600 mt-2">{heading.subtitle}</p>
            )}
            {block.intro && (
              <p className="text-sm text-neutral-600 mt-2">{block.intro}</p>
            )}
          </div>
        )}

        <div
          className={cn(
            layout === "icons-row"
              ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
              : layout === "grid"
                ? "grid gap-6 sm:grid-cols-2"
                : "space-y-4",
          )}
        >
          {features.map((feature, index) => (
            <article
              key={`${feature.title}-${index}`}
              className={cn(
                "rounded-2xl border bg-white p-5 shadow-sm",
                layout === "list" && "flex items-start gap-4",
              )}
            >
              {feature.icon && (
                <div className="text-3xl text-orange-500" aria-hidden>
                  {feature.icon}
                </div>
              )}
              <div>
                <p className="font-semibold text-lg">{feature.title}</p>
                {feature.description && (
                  <p className="mt-2 text-sm text-neutral-600">{feature.description}</p>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
