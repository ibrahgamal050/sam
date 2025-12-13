import "server-only"
import type { SocialProofBlock, HeadingContent } from "@/types/blocks"
import { cn } from "@/lib/utils"

const coerceHeading = (heading?: SocialProofBlock["heading"]): HeadingContent | undefined => {
  if (!heading) return undefined
  if (typeof heading === "string") return { title: heading }
  return heading
}

export default function SocialProof(block: SocialProofBlock) {
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
      data-block-type="socialProof"
    >
      <div className="mx-auto max-w-5xl space-y-6 text-center">
        {heading?.title && (
          <h2 className="text-2xl sm:text-3xl font-extrabold">{heading.title}</h2>
        )}
        {heading?.subtitle && (
          <p className="text-sm text-neutral-600">{heading.subtitle}</p>
        )}

        <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-neutral-600">
          {block.rating && (
            <span className="inline-flex items-center gap-1 text-lg font-semibold text-orange-600">
              ⭐ {block.rating.toFixed(1)}
            </span>
          )}
          {block.ratingLabel && <span>{block.ratingLabel}</span>}
          {block.reviewCount && <span>{block.reviewCount}</span>}
        </div>

        {block.badges && block.badges.length > 0 && (
          <div className="flex flex-wrap justify-center gap-3">
            {block.badges.map((badge) => (
              <span
                key={badge}
                className="rounded-full border border-orange-200 bg-orange-50 px-4 py-1 text-xs font-semibold text-orange-700"
              >
                {badge}
              </span>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
