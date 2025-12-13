import "server-only"
import type { MapSectionBlock, HeadingContent } from "@/types/blocks"
import { cn } from "@/lib/utils"

const coerceHeading = (heading?: MapSectionBlock["heading"]): HeadingContent | undefined => {
  if (!heading) return undefined
  if (typeof heading === "string") return { title: heading }
  return heading
}

const normalizeBranches = (branches?: MapSectionBlock["branches"]) =>
  Array.isArray(branches) ? branches : []

export default function MapSection(block: MapSectionBlock) {
  const heading = coerceHeading(block.heading)
  const branches = normalizeBranches(block.branches)

  return (
    <section
      id={block.id}
      className={cn(
        block.theme?.background ?? "bg-[#fff8f0]",
        block.theme?.text ?? "text-gray-900",
        block.spacing?.paddingY ?? "py-14",
        block.spacing?.paddingX ?? "px-4 sm:px-6 lg:px-8",
        block.className,
      )}
      data-block-type="mapSection"
    >
      <div className="mx-auto max-w-6xl space-y-8">
        {(heading?.title || heading?.subtitle) && (
          <div className="text-center">
            {heading?.title && <h2 className="text-2xl font-extrabold">{heading.title}</h2>}
            {heading?.subtitle && (
              <p className="text-sm text-neutral-600 mt-2">{heading.subtitle}</p>
            )}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] items-start">
          <div className="rounded-3xl border bg-white shadow overflow-hidden">
            {block.mapEmbedUrl ? (
              <iframe
                title={heading?.title ?? "خريطة الفروع"}
                src={block.mapEmbedUrl}
                className="h-full w-full aspect-[4/3]"
                allowFullScreen
              />
            ) : (
              <div className="aspect-[4/3] w-full bg-gray-200 flex items-center justify-center text-sm text-gray-500">
                {block.map?.center
                  ? `خريطة عند (${block.map.center.lat.toFixed(3)}, ${block.map.center.lng.toFixed(3)})`
                  : "خريطة الفروع"}
              </div>
            )}
          </div>

          <div className="space-y-4">
            {branches.map((branch) => (
              <article key={branch.name} className="rounded-2xl border bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold">{branch.name}</p>
                    {branch.label && (
                      <p className="text-xs text-neutral-500">{branch.label}</p>
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
                {branch.phone && (
                  <p className="text-xs text-orange-600 mt-1">📞 {branch.phone}</p>
                )}
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
