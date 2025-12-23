import { Fragment } from "react"
import { cn } from "@/lib/utils"
import {
  Percent,
  List,
  Zap,
  Flame,
  Handshake,
  Users,
  Gift,
  MapPin,
  Phone,
} from "lucide-react"
import type {
  BuilderRenderOptions,
  MenuItemCardElement,
  BranchCardElement,
  SocialLinksElement,
  RatingBadgeElement,
  BadgeElement,
  ButtonsElement,
  MapElement,
  TimelineElement,
  CardElement,
  LinkCardElement,
  CarouselElement,
  AccordionElement,
  CtaGroupElement,
  ButtonElement,
} from "./types"
import type { MenuItemSummary } from "@/lib/services/menu-service"
import type { BranchSummary } from "@/lib/branch-utils"
import { elementLayoutClasses, elementLayoutStyle, gradientBackground } from "./layout"
import { renderCtaGroupElement } from "./button"

const iconMap = {
  percent: Percent,
  list: List,
  zap: Zap,
  flame: Flame,
  handshake: Handshake,
  users: Users,
  gift: Gift,
  map: MapPin,
  phone: Phone,
} as const

const renderMappedIcon = (key?: string) => {
  if (!key) return null
  const Icon = iconMap[key as keyof typeof iconMap]
  return Icon ? <Icon className="h-5 w-5" aria-hidden="true" /> : null
}

export const renderMenuItemCard = (
  element: MenuItemCardElement,
  options: BuilderRenderOptions,
) => {
  const layout = elementLayoutStyle(element.id, element.layout)
  const items = (options.dataSources?.menuItems as MenuItemSummary[] | undefined) ?? []
  const item = element.itemId ? items.find((it) => it._id === element.itemId || it.id === element.itemId) : items[0]
  if (!item) return null

  return (
    <Fragment key={element.id}>
      {layout.css ? <style data-element-style={element.id} dangerouslySetInnerHTML={{ __html: layout.css }} /> : null}
      <article
        data-element-id={element.id}
        className={cn(
          "rounded-2xl bg-white shadow-md shadow-amber-100/60 flex flex-col gap-2 p-3 md:p-4",
          elementLayoutClasses(element.layout),
        )}
        style={layout.style}
      >
        {element.showImage !== false && item.image ? (
          <div className="overflow-hidden rounded-xl" style={{ height: element.imageHeight ?? "160px" }}>
            <img src={item.image} alt={item.name ?? ""} className="h-full w-full object-cover" />
          </div>
        ) : null}
        <h3 className="text-base md:text-lg font-bold text-stone-900">{item.name}</h3>
        {element.showDescription !== false && item.description ? (
          <p className="text-sm text-stone-600 leading-relaxed">{item.description}</p>
        ) : null}
        <div className="mt-auto flex items-center justify-between gap-2">
          {element.showPrice !== false && item.price !== undefined ? (
            <span className="text-sm md:text-base font-semibold text-amber-700">{item.price} جنيه</span>
          ) : null}
          {element.showBadge !== false && item.badge ? (
            <span className="text-[11px] px-2 py-1 rounded-full bg-amber-100 text-amber-700">{item.badge}</span>
          ) : null}
        </div>
      </article>
    </Fragment>
  )
}

export const renderBranchCard = (
  element: BranchCardElement,
  options: BuilderRenderOptions,
) => {
  const layout = elementLayoutStyle(element.id, element.layout)
  const branches = (options.dataSources?.branches as BranchSummary[] | undefined) ?? []
  const branch = element.branchId
    ? branches.find((b) => b.id === element.branchId || b.name === element.branchId)
    : branches[0]
  if (!branch) return null

  return (
    <Fragment key={element.id}>
      {layout.css ? <style data-element-style={element.id} dangerouslySetInnerHTML={{ __html: layout.css }} /> : null}
      <article
        data-element-id={element.id}
        className={cn(
          "rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/40 transition",
          elementLayoutClasses(element.layout),
        )}
        style={layout.style}
      >
        <h3 className="text-lg font-semibold text-slate-900">{branch.name}</h3>
        {element.showAddress !== false && branch.address ? (
          <p className="mt-2 text-sm text-slate-600">{branch.address}</p>
        ) : null}
        {element.showPhone !== false && branch.phone ? (
          <p className="mt-2 text-sm font-medium text-slate-800">
            <span className="text-slate-500">هاتف:</span> {branch.phone}
          </p>
        ) : null}
      </article>
    </Fragment>
  )
}

export const renderSocialLinks = (element: SocialLinksElement, options: BuilderRenderOptions) => {
  const layout = elementLayoutStyle(element.id, element.layout)
  const links = element.links ?? []
  const dir = options.locale === "ar" ? "rtl" : "ltr"
  const alignClass = element.align === "center" ? "justify-center" : element.align === "end" ? "justify-end" : "justify-start"
  const defaultColor = element.buttonColor ?? "#0f172a"
  const defaultTextColor = element.buttonTextColor ?? "#0f172a"
  const defaultVariant = element.buttonVariant ?? "outline"

  return (
    <Fragment key={element.id}>
      {layout.css ? <style data-element-style={element.id} dangerouslySetInnerHTML={{ __html: layout.css }} /> : null}
      <div
        data-element-id={element.id}
        className={cn(
          "flex flex-wrap items-center",
          alignClass,
          elementLayoutClasses(element.layout),
        )}
        style={{ ...layout.style, background: element.background ?? layout.style?.background }}
        dir={dir}
      >
        {links.map((link) => {
          const color = link.color ?? defaultColor
          const textColor = link.textColor ?? defaultTextColor
          const variant = link.variant ?? defaultVariant
          const isSolid = variant === "solid"
          const background = link.background ?? (isSolid ? color : "transparent")

          const style = {
            backgroundColor: background,
            color: isSolid ? textColor : textColor ?? color,
            borderColor: color,
          } satisfies CSSProperties

          return (
            <a
              key={link.href}
              href={link.href}
              className={cn(
                "mr-2 mb-2 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm transition-colors",
                isSolid ? "border border-transparent" : "border",
              )}
              style={style}
            >
              {link.icon ? <span className="text-base" aria-hidden="true">{link.icon}</span> : null}
              <span>{link.label}</span>
            </a>
          )
        })}
      </div>
    </Fragment>
  )
}

export const renderRatingBadge = (element: RatingBadgeElement, options: BuilderRenderOptions) => {
  const layout = elementLayoutStyle(element.id, element.layout)
  const value = element.value ?? 5
  const max = element.max ?? 5
  const label = element.label ?? "التقييم"
  const pct = Math.min(Math.max(value / max, 0), 1)
  const gradient = gradientBackground({ from: "#fbbf24", to: "#f59e0b", angle: 90 })

  return (
    <Fragment key={element.id}>
      {layout.css ? <style data-element-style={element.id} dangerouslySetInnerHTML={{ __html: layout.css }} /> : null}
      <div
        data-element-id={element.id}
        className={cn(
          "inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-800",
          elementLayoutClasses(element.layout),
        )}
        style={{ ...layout.style, backgroundImage: gradient ?? undefined }}
      >
        <span>{label}</span>
        <span className="rounded-full bg-white/70 px-2 py-0.5 text-amber-700">{value.toFixed(1)} / {max}</span>
        <span className="h-2 w-16 overflow-hidden rounded-full bg-white/60">
          <span className="block h-full bg-amber-600" style={{ width: `${pct * 100}%` }} />
        </span>
      </div>
    </Fragment>
  )
}

export const renderBadgeElement = (element: BadgeElement, options: BuilderRenderOptions) => {
  const layout = elementLayoutStyle(element.id, element.layout)
  const badge = element.badge ?? {}
  const settings = badge.settings ?? {}
  const variant = settings.variant ?? "solid"
  const bg = settings.color ?? "#000"
  const textColor = settings.textColor ?? "#fff"
  const alignClass = settings.align === "center" ? "justify-center" : settings.align === "end" ? "justify-end" : "justify-start"

  return (
    <Fragment key={element.id}>
      {layout.css ? <style data-element-style={element.id} dangerouslySetInnerHTML={{ __html: layout.css }} /> : null}
      <div
        data-element-id={element.id}
        className={cn("flex w-full", alignClass, elementLayoutClasses(element.layout))}
        style={layout.style}
      >
        <span
          className={cn(
            "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]",
            variant === "outline" ? "border" : null,
          )}
          style={{
            backgroundColor: variant === "solid" ? bg : "transparent",
            color: textColor,
            borderColor: variant === "outline" ? bg : undefined,
          }}
          dangerouslySetInnerHTML={{ __html: badge.value ?? "" }}
        />
      </div>
    </Fragment>
  )
}

export const renderButtonsElement = (element: ButtonsElement, options: BuilderRenderOptions) => {
  const btns = element.buttons?.items ?? []
  const items: ButtonElement[] = btns.map((item, index) => ({
    id: `${element.id}-btn-${index}`,
    type: "button",
    position: index,
    text: { type: "text", value: item.label ?? "" },
    href: item.href ?? "#",
    variant: item.variant ?? "primary",
    iconLeft: item.iconLeft,
    iconRight: item.iconRight,
    style: item.style,
    hoverStyle: item.hoverStyle,
  }))
  const group: CtaGroupElement = {
    ...element,
    type: "cta-group",
    buttons: items,
    align: element.buttons?.align,
    gap: "0.75rem",
  }
  return renderCtaGroupElement(group, options)
}

export const renderMapElement = (element: MapElement, options: BuilderRenderOptions) => {
  const layout = elementLayoutStyle(element.id, element.layout)
  const map = element.map ?? {}
  const mode = map.mode ?? "link"
  const title = map.title ?? "الخريطة والفروع"
  const note = map.note
  const href = map.href ?? "/branches"
  const palette = options.theme?.palette

  return (
    <Fragment key={element.id}>
      {layout.css ? <style data-element-style={element.id} dangerouslySetInnerHTML={{ __html: layout.css }} /> : null}
      <div
        data-element-id={element.id}
        className={cn(
          "flex h-full flex-col gap-3 rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm shadow-black/5",
          elementLayoutClasses(element.layout),
        )}
        style={layout.style}
      >
        <div className="flex flex-col gap-1">
          <h3 className="text-lg font-bold text-slate-900">{title}</h3>
          {note ? <p className="text-sm text-slate-600 leading-relaxed">{note}</p> : null}
        </div>
        {mode === "embed" && map.lat !== undefined && map.lng !== undefined ? (
          <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50" style={{ minHeight: "220px" }}>
            <iframe
              title={title}
              src={`https://www.google.com/maps?q=${map.lat},${map.lng}&z=${map.zoom ?? 14}&output=embed`}
              className="h-full w-full"
              loading="lazy"
            />
          </div>
        ) : (
          <a
            href={href}
            className="inline-flex items-center gap-2 text-sm font-semibold"
            style={{ color: palette?.primary ?? "#b91c1c" }}
          >
            <span>افتح صفحة الفروع</span>
            <span aria-hidden>→</span>
          </a>
        )}
      </div>
    </Fragment>
  )
}

export const renderTimelineElement = (element: TimelineElement, options: BuilderRenderOptions) => {
  const layout = elementLayoutStyle(element.id, element.layout)
  const items = element.timeline?.items ?? []

  return (
    <Fragment key={element.id}>
      {layout.css ? <style data-element-style={element.id} dangerouslySetInnerHTML={{ __html: layout.css }} /> : null}
      <div
        data-element-id={element.id}
        className={cn("flex w-full flex-col gap-4", elementLayoutClasses(element.layout))}
        style={layout.style}
      >
        {items.map((item, idx) => (
          <div key={`${element.id}-step-${idx}`} className="flex gap-3">
            <div className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-black/80 text-amber-300 font-bold">
              {idx + 1}
            </div>
            <div className="flex-1 rounded-2xl bg-white/80 p-3 shadow-sm shadow-black/5">
              {item.title ? <h4 className="text-base font-semibold text-slate-900">{item.title}</h4> : null}
              {item.text ? <p className="mt-1 text-sm text-slate-700 leading-relaxed">{item.text}</p> : null}
            </div>
          </div>
        ))}
      </div>
    </Fragment>
  )
}

export const renderCardElement = (element: CardElement, options: BuilderRenderOptions) => {
  const layout = elementLayoutStyle(element.id, element.layout)
  const card = element.card ?? {}
  const bg = card.theme?.bg ?? "rgba(255,205,5,0.10)"
  const textColor = card.theme?.text ?? "#0f172a"
  const iconNode = renderMappedIcon(card.icon)

  return (
    <Fragment key={element.id}>
      {layout.css ? <style data-element-style={element.id} dangerouslySetInnerHTML={{ __html: layout.css }} /> : null}
      <article
        data-element-id={element.id}
        className={cn(
          "flex h-full flex-col gap-2 rounded-2xl p-4 shadow-sm shadow-black/5",
          elementLayoutClasses(element.layout),
        )}
        style={{ ...layout.style, backgroundColor: bg, color: textColor }}
      >
        {iconNode ? <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-white/15 text-current">{iconNode}</span> : null}
        {card.title ? <h3 className="text-lg font-bold" dangerouslySetInnerHTML={{ __html: card.title }} /> : null}
        {card.text ? <p className="text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: card.text }} /> : null}
      </article>
    </Fragment>
  )
}

export const renderLinkCardElement = (element: LinkCardElement, options: BuilderRenderOptions) => {
  const layout = elementLayoutStyle(element.id, element.layout)
  const card = element.linkCard ?? {}
  const bg = card.theme?.bg ?? "rgba(255,255,255,0.08)"
  const textColor = card.theme?.text ?? options.theme?.palette?.text ?? "#0f172a"
  const iconNode = renderMappedIcon(card.icon)

  return (
    <Fragment key={element.id}>
      {layout.css ? <style data-element-style={element.id} dangerouslySetInnerHTML={{ __html: layout.css }} /> : null}
      <a
        data-element-id={element.id}
        href={card.href ?? "#"}
        className={cn(
          "flex h-full flex-col gap-2 rounded-2xl p-4 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/10",
          elementLayoutClasses(element.layout),
        )}
        style={{ ...layout.style, backgroundColor: bg, color: textColor }}
      >
        {iconNode ? <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-white/12 text-current">{iconNode}</span> : null}
        {card.title ? <h3 className="text-lg font-bold" dangerouslySetInnerHTML={{ __html: card.title }} /> : null}
        {card.text ? <p className="text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: card.text }} /> : null}
      </a>
    </Fragment>
  )
}

export const renderCarouselElement = (element: CarouselElement, options: BuilderRenderOptions) => {
  const layout = elementLayoutStyle(element.id, element.layout)
  const items = element.carousel?.items ?? []
  const dir = options.locale === "ar" ? "rtl" : "ltr"

  return (
    <Fragment key={element.id}>
      {layout.css ? <style data-element-style={element.id} dangerouslySetInnerHTML={{ __html: layout.css }} /> : null}
      <div
        data-element-id={element.id}
        className={cn(
          "w-full overflow-x-auto no-scrollbar",
          elementLayoutClasses(element.layout),
        )}
        style={layout.style}
        dir={dir}
      >
        <div className="flex min-w-full gap-3 snap-x snap-mandatory">
          {items.map((item, idx) => (
            <article
              key={`${element.id}-slide-${idx}`}
              className="min-w-[240px] max-w-[320px] flex-1 snap-start rounded-2xl bg-white/90 p-4 shadow-sm shadow-black/5"
            >
              {item.title ? <h3 className="text-lg font-semibold text-amber-600">{item.title}</h3> : null}
              {item.text ? <p className="mt-2 text-sm text-slate-800 leading-relaxed">{item.text}</p> : null}
              {item.name ? <p className="mt-3 text-xs font-semibold text-slate-500 uppercase tracking-[0.2em]">{item.name}</p> : null}
            </article>
          ))}
        </div>
      </div>
    </Fragment>
  )
}

export const renderAccordionElement = (element: AccordionElement, options: BuilderRenderOptions) => {
  const layout = elementLayoutStyle(element.id, element.layout)
  const items = element.accordion?.items ?? []

  return (
    <Fragment key={element.id}>
      {layout.css ? <style data-element-style={element.id} dangerouslySetInnerHTML={{ __html: layout.css }} /> : null}
      <div
        data-element-id={element.id}
        className={cn("w-full rounded-2xl border border-slate-200 bg-white/90 divide-y divide-slate-200", elementLayoutClasses(element.layout))}
        style={layout.style}
      >
        {items.map((item, idx) => (
          <details key={`${element.id}-faq-${idx}`} className="group p-4" open={idx === 0}>
            <summary className="flex cursor-pointer items-center justify-between text-base font-semibold text-slate-900">
              <span>{item.q}</span>
              <span className="text-sm text-amber-600 transition group-open:rotate-45">+</span>
            </summary>
            {item.a ? <p className="mt-2 text-sm text-slate-700 leading-relaxed">{item.a}</p> : null}
          </details>
        ))}
      </div>
    </Fragment>
  )
}
