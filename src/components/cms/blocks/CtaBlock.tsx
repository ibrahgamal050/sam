import "server-only"
import type { CTABlock, HeadingContent } from "@/types/blocks"
import { cn } from "@/lib/utils"

const coerceHeading = (heading?: CTABlock["heading"]): HeadingContent | undefined => {
  if (!heading) return undefined
  if (typeof heading === "string") return { title: heading }
  return heading
}

const buttonStyle = (button?: CTAButton) =>
  button?.style
    ? {
        backgroundColor: button.style.bgColor,
        color: button.style.textColor,
        borderColor: button.style.borderColor,
      }
    : undefined

export default function CtaBlock(block: CTABlock) {
  const heading = coerceHeading(block.heading)

  return (
    <section
      id={block.id}
      className={cn(
        block.theme?.background ?? "bg-gray-900",
        block.theme?.text ?? "text-white",
        block.spacing?.paddingY ?? "py-16",
        block.spacing?.paddingX ?? "px-4 sm:px-6 lg:px-8",
        block.className,
      )}
      data-block-type="cta"
    >
      <div className="mx-auto max-w-4xl text-center space-y-4">
        {heading?.eyebrow && (
          <span className="text-xs uppercase tracking-[0.4em] text-white/70">
            {heading.eyebrow}
          </span>
        )}
        {heading?.title && <h2 className="text-3xl font-bold">{heading.title}</h2>}
        {heading?.subtitle && (
          <p className="text-base text-white/80">{heading.subtitle}</p>
        )}
        {heading && "note" in heading && heading.note && (
          <p className="text-xs text-white/60">{heading.note}</p>
        )}

        <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
          {block.primaryButton && (
            <a
              href={block.primaryButton.href}
              className="inline-flex rounded-full px-6 py-3 text-sm font-semibold shadow bg-[#f5c400] text-gray-900"
              style={buttonStyle(block.primaryButton)}
            >
              {block.primaryButton.text ?? block.primaryButton.label}
            </a>
          )}
          {block.secondaryButton && (
            <a
              href={block.secondaryButton.href}
              className="inline-flex rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white"
              style={buttonStyle(block.secondaryButton)}
            >
              {block.secondaryButton.text ?? block.secondaryButton.label}
            </a>
          )}
          {!block.primaryButton && !block.secondaryButton && block.cta && (
            <a
              href={block.cta.href}
              className="inline-flex rounded-full px-6 py-3 text-sm font-semibold shadow bg-[#f5c400] text-gray-900"
              style={buttonStyle(block.cta)}
            >
              {block.cta.text ?? block.cta.label}
            </a>
          )}
        </div>
      </div>
    </section>
  )
}
