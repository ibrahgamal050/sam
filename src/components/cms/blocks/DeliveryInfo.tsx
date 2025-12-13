import "server-only"
import type { DeliveryInfoBlock, HeadingContent } from "@/types/blocks"
import { cn } from "@/lib/utils"

const coerceHeading = (heading?: DeliveryInfoBlock["heading"]): HeadingContent | undefined => {
  if (!heading) return undefined
  if (typeof heading === "string") return { title: heading }
  return heading
}

export default function DeliveryInfo(block: DeliveryInfoBlock) {
  const heading = coerceHeading(block.heading)
  const options =
    block.deliveryOptions ??
    block.methods?.map((method) => ({
      label: method.title ?? method.label ?? "",
      description: method.description,
      icon: method.icon,
    }))

  return (
    <section
      id={block.id}
      className={cn(
        block.theme?.background ?? "bg-[#c8102e]",
        block.theme?.text ?? "text-white",
        block.spacing?.paddingY ?? "py-14",
        block.spacing?.paddingX ?? "px-4 sm:px-6 lg:px-8",
        block.className,
      )}
      data-block-type="deliveryInfo"
    >
      <div className="mx-auto max-w-6xl space-y-8">
        {(heading?.title || heading?.subtitle) && (
          <div>
            {heading?.eyebrow && (
              <span className="text-xs uppercase tracking-[0.35em] text-white/70">
                {heading.eyebrow}
              </span>
            )}
            {heading?.title && <h2 className="text-2xl sm:text-3xl font-extrabold">{heading.title}</h2>}
            {heading?.subtitle && (
              <p className="text-sm text-white/80 mt-2">{heading.subtitle}</p>
            )}
          </div>
        )}

        {block.hotline && (
          <div className="rounded-2xl border border-white/20 bg-white/10 px-6 py-4 text-lg font-semibold tracking-wide">
            الخط الساخن: {block.hotline}
          </div>
        )}

        {block.note && (
          <p className="text-xs text-white/70">{block.note}</p>
        )}

        {options?.length ? (
          <div className="grid gap-4 sm:grid-cols-3">
            {options.map((option, idx) => (
              <div key={`${option.label}-${idx}`} className="rounded-2xl bg-white/10 p-4 shadow-sm">
                {option.icon && (
                  <span className="text-2xl" aria-hidden>
                    {option.icon}
                  </span>
                )}
                <p className="mt-3 text-lg font-semibold">{option.label}</p>
                {option.description && (
                  <p className="text-sm text-white/80 mt-1">{option.description}</p>
                )}
              </div>
            ))}
          </div>
        ) : null}

        {block.buttons && block.buttons.length > 0 && (
          <div className="flex flex-wrap gap-4">
            {block.buttons.map((button) => (
              <a
                key={button.href}
                href={button.href}
                className="inline-flex rounded-full px-6 py-3 text-sm font-semibold shadow bg-white text-[#c8102e]"
                style={
                  button.style
                    ? {
                        backgroundColor: button.style.bgColor,
                        color: button.style.textColor,
                        borderColor: button.style.borderColor,
                      }
                    : undefined
                }
              >
                {button.text ?? button.label}
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
