import "server-only"
import type { ChefSectionBlock, HeadingContent } from "@/types/blocks"
import { cn } from "@/lib/utils"

const coerceHeading = (heading?: ChefSectionBlock["heading"]): HeadingContent | undefined => {
  if (!heading) return undefined
  if (typeof heading === "string") return { title: heading }
  return heading
}

export default function ChefSection(block: ChefSectionBlock) {
  const heading = coerceHeading(block.heading)

  return (
    <section
      id={block.id}
      className={cn(
        block.theme?.background ?? "bg-white",
        block.theme?.text ?? "text-gray-900",
        block.spacing?.paddingY ?? "py-14",
        block.spacing?.paddingX ?? "px-4 sm:px-6 lg:px-8",
        block.className,
      )}
      data-block-type="chefSection"
    >
      <div className="mx-auto max-w-6xl grid gap-8 lg:grid-cols-[1.2fr_0.8fr] items-center">
        <div className="space-y-4">
          {heading?.eyebrow && (
            <span className="text-xs uppercase tracking-[0.35em] text-neutral-500">
              {heading.eyebrow}
            </span>
          )}
          {heading?.title && (
            <h2 className="text-2xl sm:text-3xl font-extrabold">{heading.title}</h2>
          )}
          {heading?.subtitle && (
            <p className="text-base text-neutral-600">{heading.subtitle}</p>
          )}
          {block.highlights && block.highlights.length > 0 && (
            <ul className="space-y-2 text-sm">
              {block.highlights.map((highlight, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-orange-500">•</span>
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        {block.chef && (
          <div className="rounded-3xl border bg-white p-6 shadow-sm space-y-4 text-center">
            {block.chef.image && (
              <div className="mx-auto h-40 w-40 overflow-hidden rounded-full">
                <img
                  src={block.chef.image}
                  alt={block.chef.name}
                  className="h-full w-full object-cover"
                />
              </div>
            )}
            <div>
              <p className="text-lg font-semibold">{block.chef.name}</p>
              {block.chef.role && (
                <p className="text-sm text-neutral-500">{block.chef.role}</p>
              )}
            </div>
            {block.chef.quote && (
              <blockquote className="text-sm italic text-neutral-700">
                “{block.chef.quote}”
              </blockquote>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
