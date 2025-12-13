import "server-only"
import type { BranchesContactBlock, HeadingContent } from "@/types/blocks"
import { cn } from "@/lib/utils"

const containerBySpacing = (spacing?: BranchesContactBlock["spacing"]) => {
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

const coerceHeading = (
  heading?: BranchesContactBlock["heading"],
): HeadingContent | undefined => {
  if (!heading) return undefined
  if (typeof heading === "string") return { title: heading }
  return heading
}

export default function BranchesContact(block: BranchesContactBlock) {
  const heading = coerceHeading(block.heading)
  const contact = block.contact ?? {
    email: (block as any).email,
    phone: (block as any).phone,
    social: (block as any).social,
  }
  const sectionPaddingY = block.spacing?.paddingY ?? "py-14"
  const sectionPaddingX = block.spacing?.paddingX ?? "px-4 sm:px-6 lg:px-8"

  const layout = block.layout ?? "map-left"
  const containerClass = cn(
    "grid gap-6",
    layout === "stacked" ? "grid-cols-1" : "lg:grid-cols-3",
  )

  return (
    <section
      id={block.id ?? "branches"}
      className={cn(
        block.theme?.background ?? "bg-white",
        block.theme?.text ?? "text-gray-900",
        sectionPaddingY,
        sectionPaddingX,
        block.className,
      )}
      data-block-type="branchesContact"
    >
      <div className={cn("mx-auto", containerBySpacing(block.spacing))}>
        {(heading?.title || heading?.subtitle) && (
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
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
                <p className="text-sm text-neutral-600">{heading.subtitle}</p>
              )}
            </div>
            {contact?.email && (
              <a
                href={`mailto:${contact.email}`}
                className="text-sm font-semibold text-orange-600 underline"
              >
                {contact.email}
              </a>
            )}
          </div>
        )}

        <div className={containerClass}>
          {(layout === "map-left" || layout === "map-right") && (
            <div
              className={cn(
                "rounded-2xl border shadow-sm bg-white overflow-hidden",
                layout === "map-right" ? "lg:order-2" : "lg:col-span-2",
                layout === "map-right" && "lg:col-span-2",
              )}
            >
              <div className="aspect-[16/9]">
                <iframe
                  title="خريطة الفروع"
                  src={
                    block.mapEmbedSrc ??
                    "https://www.openstreetmap.org/export/embed.html?bbox=31.20%2C30.02%2C31.28%2C30.09&layer=mapnik"
                  }
                  className="h-full w-full"
                  allowFullScreen
                />
              </div>
            </div>
          )}

          <div
            className={cn(
              "space-y-4 lg:col-span-1",
              layout === "map-right" ? "lg:order-1" : "",
            )}
          >
            {block.branches.map((branch) => (
              <div key={branch.name} className="rounded-2xl border bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-lg">{branch.name}</p>
                    {branch.area && <p className="text-xs text-neutral-500">{branch.area}</p>}
                  </div>
                  {branch.hours && (
                    <span className="text-xs rounded-full bg-neutral-100 px-3 py-1 text-neutral-600">
                      {branch.hours}
                    </span>
                  )}
                </div>
                <p className="mt-2 text-sm">{branch.address}</p>
                <div className="mt-3 flex flex-wrap gap-4 text-sm text-neutral-600">
                  {branch.phone && <span>📞 {branch.phone}</span>}
                  {branch.maps && (
                    <a
                      href={branch.maps}
                      target="_blank"
                      rel="noreferrer"
                      className="underline text-orange-600"
                    >
                      فتح على الخريطة
                    </a>
                  )}
                </div>
              </div>
            ))}

            {(contact?.email || contact?.phone || contact?.social?.length) && (
              <div className="rounded-2xl border bg-white p-5 shadow-sm">
                <p className="font-semibold mb-2">التواصل</p>
                {contact?.phone && (
                  <p className="text-sm">
                    📞{" "}
                    <a href={`tel:${contact.phone}`} className="underline">
                      {contact.phone}
                    </a>
                  </p>
                )}
                {contact?.email && (
                  <p className="text-sm">
                    📧{" "}
                    <a href={`mailto:${contact.email}`} className="underline">
                      {contact.email}
                    </a>
                  </p>
                )}
                {contact?.social && contact.social.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-3 text-sm">
                    {contact.social.map((social) => (
                      <a
                        key={social.href}
                        href={social.href}
                        target="_blank"
                        rel="noreferrer"
                        className="underline text-orange-600"
                      >
                        {social.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
