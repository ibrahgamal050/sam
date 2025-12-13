import "server-only"
import Image from "next/image"
import type { CSSProperties } from "react"
import type { HeroBlock, CTAButton } from "@/types/blocks"
import { cn } from "@/lib/utils"

const HEIGHT_CLASS: Record<NonNullable<HeroBlock["layout"]>["height"] | "md", string> = {
  full: "min-h-[80vh]",
  lg: "min-h-[560px]",
  md: "min-h-[460px]",
  sm: "min-h-[360px]",
}

const ALIGN_CLASS: Record<NonNullable<HeroBlock["layout"]>["align"] | "center", string> = {
  start: "items-center justify-start text-start",
  center: "items-center justify-center text-center",
  end: "items-center justify-end text-end",
}

const CONTENT_WIDTH: Record<NonNullable<HeroBlock["layout"]>["contentWidth"] | "normal", string> = {
  narrow: "md:max-w-2xl",
  normal: "md:max-w-3xl",
  wide: "md:max-w-4xl",
}

const CTA_VARIANTS: Record<NonNullable<CTAButton["variant"]> | "primary", string> = {
  primary:
    "bg-[var(--hero-cta-bg)] text-[var(--hero-cta-text)] hover:bg-[var(--hero-cta-bg-hover)] border-transparent",
  secondary:
    "bg-white/10 text-white hover:bg-white/20 border border-white/40",
  outline:
    "border border-[var(--hero-cta-bg)] text-[var(--hero-cta-bg)] hover:bg-[var(--hero-cta-bg)] hover:text-[var(--hero-cta-text)]",
  ghost:
    "text-[var(--hero-cta-text)] hover:bg-white/10",
}

const containerBySpacing = (spacing?: HeroBlock["spacing"]) => {
  switch (spacing?.container) {
    case "xs":
      return "max-w-xl"
    case "sm":
      return "max-w-2xl"
    case "md":
      return "max-w-3xl"
    case "lg":
      return "max-w-5xl"
    case "xl":
      return "max-w-7xl"
    case "full":
      return "max-w-none"
    default:
      return "max-w-7xl"
  }
}

export default function Hero(block: HeroBlock) {
  const {
    id = "hero",
    title,
    subtitle: rawSubtitle,
    kicker: rawKicker,
    badge,
    layout,
    media,
    backgroundImage,
    bgAlt,
    ctas,
    legacyCta,
    spacing,
    theme,
    className,
  } = block

  const heading =
    typeof block.heading === "string"
      ? { title: block.heading }
      : block.heading

  const legacyColors = (block as any).colors ?? {}
  const kicker = rawKicker ?? (block as any).eyebrow ?? heading?.eyebrow
  const titleText =
    block.title ?? heading?.title ?? (block as any).heading ?? "مطعم"
  const subtitle =
    rawSubtitle ?? (block as any).subheading ?? heading?.subtitle ?? (block as any).description
  const legacyButtons: CTAButton[] = []
  if ((block as any).primaryButton) {
    legacyButtons.push({
      text: (block as any).primaryButton.text ?? (block as any).primaryButton.label,
      href: (block as any).primaryButton.href,
      style: (block as any).primaryButton.style,
    })
  }
  if ((block as any).secondaryButton) {
    legacyButtons.push({
      text: (block as any).secondaryButton.text ?? (block as any).secondaryButton.label,
      href: (block as any).secondaryButton.href,
      variant: "outline",
      style: (block as any).secondaryButton.style,
    })
  }

  const resolvedCtas: CTAButton[] =
    Array.isArray(ctas) && ctas.length
      ? ctas
      : legacyButtons.length
        ? legacyButtons
        : legacyCta
          ? [{ text: legacyCta.text, href: legacyCta.href }]
          : (block as any).cta
            ? [{ text: (block as any).cta.text, href: (block as any).cta.href }]
            : []

  if ((block as any).ctaPrimary) {
    legacyButtons.push({
      text: (block as any).ctaPrimary.text ?? (block as any).ctaPrimary.label,
      href: (block as any).ctaPrimary.href,
      style: (block as any).ctaPrimary.style,
    })
  }
  if ((block as any).ctaSecondary) {
    legacyButtons.push({
      text: (block as any).ctaSecondary.text ?? (block as any).ctaSecondary.label,
      href: (block as any).ctaSecondary.href,
      variant: "outline",
      style: (block as any).ctaSecondary.style,
    })
  }

  const bgImage = media?.image ?? backgroundImage ?? (block as any).image ?? (block as any).bgImage ?? "/images/hero-grills.jpg"
  const align = layout?.align ?? (block as any).align ?? "center"
  const height = layout?.height ?? (block as any).height ?? "md"
  const overlayVariant =
    layout?.variant ?? (block as any).variant ?? (media?.image ? "gradient" : "solid")
  const overlayOpacity =
    layout?.overlayOpacity ?? (block as any).overlayOpacity ?? 0.45
  const mode = layout?.mode ?? (block as any).layout ?? "split"

  const styleVars: CSSProperties = {
    ["--hero-grad-from" as any]:
      theme?.gradient?.from ?? legacyColors.gradFrom ?? theme?.accent ?? "#f97316",
    ["--hero-grad-to" as any]:
      theme?.gradient?.to ?? legacyColors.gradTo ?? "#dc2626",
    ["--hero-solid" as any]: theme?.background ?? legacyColors.solid ?? "rgba(0,0,0,0.65)",
    ["--hero-text" as any]: theme?.text ?? "#ffffff",
    ["--hero-subtext" as any]:
      theme?.mutedText ?? legacyColors.subtitle ?? "rgba(255,255,255,0.85)",
    ["--hero-cta-bg" as any]: theme?.ctaBg ?? legacyColors.ctaBg ?? "#ea580c",
    ["--hero-cta-bg-hover" as any]:
      theme?.ctaBgHover ?? legacyColors.ctaBgHover ?? "#c2410c",
    ["--hero-cta-text" as any]: theme?.ctaText ?? legacyColors.ctaText ?? "#ffffff",
    ["--hero-ribbon" as any]:
      theme?.ribbon ?? legacyColors.ribbon ?? theme?.accent ?? "#16a34a",
    ["--hero-overlay" as any]: String(Math.min(1, Math.max(0, overlayOpacity))),
  }

  const sectionPaddingY = spacing?.paddingY ?? "py-16"
  const sectionPaddingX = spacing?.paddingX ?? "px-4 sm:px-6 lg:px-8"

  return (
    <section
      id={id}
      className={cn("relative overflow-hidden", sectionPaddingY, sectionPaddingX, className)}
      style={styleVars}
      data-block-type="hero"
    >
      <div className="absolute inset-0">
        {bgImage ? (
          <Image
            src={bgImage}
            alt={media?.alt ?? bgAlt ?? "Hero background"}
            fill
            priority
            className="object-cover"
            style={{
              objectPosition: media?.position,
              ...(media?.brightness ? { filter: `brightness(${media.brightness})` } : {}),
            }}
            sizes="100vw"
          />
        ) : null}

        {overlayVariant !== "image" && (
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                overlayVariant === "gradient"
                  ? "linear-gradient(135deg, var(--hero-grad-from), var(--hero-grad-to))"
                  : "var(--hero-solid)",
              opacity: "var(--hero-overlay)",
            }}
          />
        )}
      </div>

      <div
        className={cn(
          "relative flex",
          mode === "fullWidthOverlay" ? "w-full" : ["mx-auto", containerBySpacing(spacing)],
          HEIGHT_CLASS[height] ?? HEIGHT_CLASS.md,
          ALIGN_CLASS[align] ?? ALIGN_CLASS.center,
        )}
      >
        <div
          className={cn(
            "w-full",
            mode === "fullWidthOverlay" ? "max-w-4xl mx-auto" : CONTENT_WIDTH[layout?.contentWidth ?? "normal"],
          )}
        >
          {kicker && (
            <span className="text-sm font-semibold uppercase tracking-[0.3em] text-white/70">
              {kicker}
            </span>
          )}

          {badge?.text && (
            <span
              className={cn(
                "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold mb-4",
                badge.tone === "outline"
                  ? "border border-white/40 text-white"
                  : badge.tone === "muted"
                    ? "bg-white/20 text-white"
                    : "bg-white text-gray-900",
              )}
              style={{
                backgroundColor: (badge as any).bgColor,
                color: (badge as any).textColor,
                borderColor: badge.tone === "outline" ? (badge as any).borderColor : undefined,
              }}
            >
              {badge.text}
            </span>
          )}

          <h1 className="text-3xl sm:text-5xl font-extrabold" style={{ color: "var(--hero-text)" }}>
            {titleText}
          </h1>

          {subtitle ? (
            <p className="mt-3 text-base sm:text-xl" style={{ color: "var(--hero-subtext)" }}>
              {subtitle}
            </p>
          ) : null}

          {resolvedCtas.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-3">
              {resolvedCtas.map((cta) => (
                <a
                  key={`${cta.text}-${cta.href}`}
                  href={cta.href}
                  target={cta.newTab ? "_blank" : "_self"}
                  rel={cta.newTab ? "noreferrer" : undefined}
                  className={cn(
                    "inline-flex rounded-full px-6 py-3 text-sm font-semibold shadow-sm transition",
                    CTA_VARIANTS[cta.variant ?? "primary"],
                  )}
                  style={
                    cta.style
                      ? {
                          backgroundColor: cta.style.bgColor,
                          color: cta.style.textColor,
                          borderColor: cta.style.borderColor,
                        }
                      : undefined
                  }
                >
                  {cta.text}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      {layout?.showRibbon !== false && (
        <div style={{ backgroundColor: "var(--hero-ribbon)" }} className="h-1 w-full" />
      )}
    </section>
  )
}
