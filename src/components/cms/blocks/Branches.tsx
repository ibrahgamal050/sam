import "server-only"
import type { BranchesBlock, HeadingContent } from "@/types/blocks"
import { cn } from "@/lib/utils"

const coerceHeading = (heading?: BranchesBlock["heading"]): HeadingContent | undefined => {
  if (!heading) return undefined
  if (typeof heading === "string") return { title: heading }
  return heading
}

export default function Branches(block: BranchesBlock) {
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
      data-block-type="branches"
    >
      <div className="mx-auto max-w-7xl space-y-8">
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

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {block.branches.map((branch) => (
            <article key={branch.name} className="rounded-2xl border bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-lg">{branch.name}</p>
                  {branch.areas && (
                    <p className="text-xs text-neutral-500">{branch.areas.join(" • ")}</p>
                  )}
                </div>
                {branch.pinColor && (
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: branch.pinColor }}
                    aria-hidden
                  />
                )}
              </div>
              <p className="mt-2 text-sm">{branch.address}</p>
              {(branch.openingHours || (branch as any).hours) && (
                <p className="mt-1 text-xs text-neutral-500">
                  {branch.openingHours ?? (branch as any).hours}
                </p>
              )}
              {branch.phone && (
                <p className="mt-3 text-sm text-orange-600 font-semibold">📞 {branch.phone}</p>
              )}
            </article>
          ))}
        </div>

        {block.cta && (
          <div className="text-center">
            <a
              href={block.cta.href}
              className="inline-flex rounded-full bg-[#b71c1c] px-6 py-3 text-sm font-semibold text-white shadow"
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
              {block.cta.text ?? block.cta.label}
            </a>
          </div>
        )}
      </div>
    </section>
  )
}
