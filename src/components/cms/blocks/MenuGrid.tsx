import "server-only"
import Link from "next/link"
import type { MenuGridBlock } from "@/types/blocks"
import { cn } from "@/lib/utils"

const containerBySpacing = (spacing?: MenuGridBlock["spacing"]) => {
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

const GRID_COLS: Record<MenuGridBlock["columns"] | 3, string> = {
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
}

const CARD_VARIANTS: Record<NonNullable<MenuGridBlock["cardsVariant"]> | "soft", string> = {
  soft: "bg-white/90 border border-white/40 shadow-sm",
  outline: "border border-gray-200 bg-white",
  plain: "border border-transparent bg-transparent",
}

export default function MenuGrid(block: MenuGridBlock) {
  const heading =
    typeof (block.heading as any) === "string"
      ? { title: block.heading as string }
      : block.heading
  const sectionPaddingY = block.spacing?.paddingY ?? "py-14"
  const sectionPaddingX = block.spacing?.paddingX ?? "px-4 sm:px-6 lg:px-8"
  const columns = block.columns ?? 3

  return (
    <section
      id={block.id}
      className={cn(
        block.theme?.background ?? "bg-[#f6f5ff]",
        block.theme?.text ?? "text-gray-900",
        sectionPaddingY,
        sectionPaddingX,
        block.className,
      )}
      data-block-type="menuGrid"
    >
      <div className={cn("mx-auto", containerBySpacing(block.spacing))}>
        {(heading?.title || heading?.subtitle) && (
          <div
            className={cn(
              "mb-8 flex flex-col gap-2",
              heading?.align === "end"
                ? "text-right"
                : heading?.align === "center"
                  ? "text-center"
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

        <div className={cn("grid gap-6", GRID_COLS[columns] ?? GRID_COLS[3])}>
          {block.items.map((item) => (
            <Link
              key={`${item.title}-${item.href}`}
              href={item.href}
              className={cn(
                "group rounded-2xl overflow-hidden transition hover:-translate-y-1",
                CARD_VARIANTS[block.cardsVariant ?? "soft"],
              )}
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={item.image}
                  alt={item.title}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.05]"
                />
                {item.badge && (
                  <span className="absolute left-3 top-3 rounded-full bg-black/70 px-3 py-1 text-xs font-semibold text-white">
                    {item.badge}
                  </span>
                )}
              </div>
              <div className="p-4 space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-bold text-lg">{item.title}</h3>
                  {block.showPrices && item.price && (
                    <span className="text-sm font-semibold text-emerald-600">{item.price}</span>
                  )}
                </div>
                {item.desc && (
                  <p className="text-sm text-neutral-600 line-clamp-2">{item.desc}</p>
                )}
                <span className="inline-flex text-sm font-medium text-orange-600 group-hover:text-orange-700">
                  {heading?.align === "end" ? "اكتشف ←" : "المزيد →"}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
