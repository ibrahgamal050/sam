import "server-only"
import type { TimelineBlock, HeadingContent } from "@/types/blocks"
import { cn } from "@/lib/utils"

const coerceHeading = (heading?: TimelineBlock["heading"]): HeadingContent | undefined => {
  if (!heading) return undefined
  if (typeof heading === "string") return { title: heading }
  return heading
}

export default function Timeline(block: TimelineBlock) {
  const heading = coerceHeading(block.heading)

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
      data-block-type="timeline"
    >
      <div className="mx-auto max-w-5xl space-y-8">
        {(heading?.title || heading?.subtitle) && (
          <div className="text-center">
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

        <ol className="relative border-l border-orange-200 pl-6 space-y-6">
          {block.steps.map((step, index) => (
            <li key={`${step.title}-${index}`} className="space-y-1">
              <span className="absolute -left-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-xs text-white">
                {index + 1}
              </span>
              {step.label && (
                <p className="text-xs uppercase tracking-[0.25em] text-orange-500">{step.label}</p>
              )}
              {step.icon && (
                <span className="text-xl text-orange-400" aria-hidden>
                  {step.icon}
                </span>
              )}
              <p className="text-lg font-semibold">{step.title}</p>
              {step.description && (
                <p className="text-sm text-neutral-600">{step.description}</p>
              )}
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
