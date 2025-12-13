import { Fragment, type CSSProperties } from "react"
import { cn } from "@/lib/utils"
import { sectionLayoutStyle, elementLayoutClasses } from "./layout"
import { mergeCssRules } from "./responsive"
import type { BuilderRenderOptions, MenuDynamicSection, GridElement } from "./types"

export const renderMenuDynamic = (
  section: MenuDynamicSection,
  sectionContext: BuilderRenderOptions,
  contentClasses: string,
  contentStyle: CSSProperties,
  wrapperClasses: string,
  wrapperStyle: CSSProperties,
  combinedCss?: string,
) => {
  const items = (sectionContext.dataSources?.menuItems as any[] | undefined) ?? []
  const legacyData = section.data ?? ({} as MenuDynamicSection["data"])
  const legacyUi = section.ui ?? ({} as MenuDynamicSection["ui"])
  const config = (section as any).config ?? {}

  const normalizedSort = (): MenuDynamicSection["data"]["sort"] => {
    if (legacyData.sort) return legacyData.sort
    const sortCfg = config.sort
    if (!sortCfg?.by) return undefined
    if (sortCfg.by === "price") return sortCfg.order === "desc" ? "price-desc" : "price-asc"
    if (sortCfg.by === "name") return "name"
    return undefined
  }

  const data: MenuDynamicSection["data"] = {
    source: legacyData.source ?? config.source ?? "menu",
    categoryId: legacyData.categoryId,
    tags: legacyData.tags ?? config.filters?.tagsAny ?? config.filters?.tagsAll ?? [],
    limit: legacyData.limit ?? config.limit,
    sort: normalizedSort(),
    showOnlyAvailable: legacyData.showOnlyAvailable ?? (config.filters?.availability === "available" ? true : undefined),
  }

  const ui: MenuDynamicSection["ui"] = {
    layout: legacyUi.layout ?? "grid",
    cols: legacyUi.cols ?? undefined,
    showImage: legacyUi.showImage ?? config.ui?.showImages ?? true,
    showPrice: legacyUi.showPrice ?? config.ui?.showPrice ?? true,
    showCalories: legacyUi.showCalories ?? false,
    cardStyle: legacyUi.cardStyle ?? (config.ui?.variant === "flat" ? "flat" : undefined),
  }

  const categoriesFilter: string[] = []
  if (data.categoryId) categoriesFilter.push(data.categoryId)
  if (Array.isArray(config.filters?.categoriesAny)) categoriesFilter.push(...config.filters.categoriesAny)
  const tagsFilter = data.tags ?? []
  const tagsAny = Array.isArray(config.filters?.tagsAny) ? config.filters.tagsAny : []
  const tagsAll = Array.isArray(config.filters?.tagsAll) ? config.filters.tagsAll : []

  const filterByCategory = categoriesFilter
  const tags = tagsFilter

  let filtered = items.slice()
  if (filterByCategory.length) {
    filtered = filtered.filter((item) => {
      const catId = item.categoryId ?? item.id
      const catKey = item.categoryKey ?? item.slug ?? item.name
      return filterByCategory.includes(catId) || filterByCategory.includes(catKey)
    })
  }
  if (tags.length || tagsAny.length || tagsAll.length) {
    const anyTags = tags.length ? tags : tagsAny
    filtered = filtered.filter((item) => {
      const itemTags = Array.isArray(item.tags) ? item.tags : []
      if (!itemTags.length) return true
      const matchesAny = anyTags.length ? anyTags.some((t) => itemTags.includes(t)) : true
      const matchesAll = tagsAll.length ? tagsAll.every((t) => itemTags.includes(t)) : true
      return matchesAny && matchesAll
    })
  }
  if (data.showOnlyAvailable) {
    filtered = filtered.filter((item) => item.isAvailable !== false)
  }

  switch (data.sort) {
    case "price-asc":
      filtered.sort((a, b) => (a.price ?? 0) - (b.price ?? 0))
      break
    case "price-desc":
      filtered.sort((a, b) => (b.price ?? 0) - (a.price ?? 0))
      break
    case "name":
      filtered.sort((a, b) => (a.name || "").localeCompare(b.name || ""))
      break
    default:
      filtered.sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
  }

  if (data.limit && filtered.length > data.limit) {
    filtered = filtered.slice(0, data.limit)
  }

  const cols = ui.cols ?? { base: 1, md: 2, lg: 3 }
  const gridClasses = cn(
    "grid w-full gap-4 md:gap-6",
    `grid-cols-${cols.base ?? 1}`,
    cols.md ? `md:grid-cols-${cols.md}` : null,
    cols.lg ? `lg:grid-cols-${cols.lg}` : null,
  )

  const imageRatio = config.ui?.imageRatio
  const imageAspectClass = imageRatio ? `aspect-[${imageRatio}]` : "aspect-[4/3]"

  const cardBase =
    ui.cardStyle === "outlined"
      ? "border border-amber-200 bg-white"
      : ui.cardStyle === "flat"
        ? "bg-white"
        : "bg-white/90 shadow-md shadow-amber-100/60"

  const layoutResult = section.layout ? sectionLayoutStyle(section.id, section.layout) : { style: {} as CSSProperties }
  const mergedWrapperStyle = { ...wrapperStyle, ...layoutResult.style }
  const mergedCss = mergeCssRules(combinedCss, layoutResult.css)

  const gridElement = Array.isArray(section.elements)
    ? (section.elements.find((el) => el.type === "grid") as GridElement | undefined)
    : undefined
  const gridLayoutClasses = gridElement ? elementLayoutClasses(gridElement.layout) : null

  return (
    <Fragment key={section.id}>
      {mergedCss ? <style data-section-style={section.id} dangerouslySetInnerHTML={{ __html: mergedCss }} /> : null}
      <section
        data-section-id={section.id}
        data-section-type={section.type}
        data-section-key={section.key}
        className={wrapperClasses}
        style={mergedWrapperStyle}
      >
        <div className={contentClasses} style={contentStyle} data-section-content={section.id}>
          <div className={cn(gridClasses, gridLayoutClasses)}>
            {filtered.length ? (
              filtered.map((item) => (
                <article
                  key={item._id ?? item.id ?? item.name}
                  className={cn(cardBase, "rounded-2xl p-3 md:p-4 flex flex-col gap-2")}
                >
                  {ui.showImage && item.image ? (
                    <div className={cn("mb-2 overflow-hidden rounded-xl", imageAspectClass)}>
                      <img
                        src={item.image}
                        alt={item.name ?? ""}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : null}
                  <h3 className="text-base md:text-lg font-bold text-stone-900">{item.name}</h3>
                  {item.description ? (
                    <p className="text-xs md:text-sm text-stone-600 leading-relaxed">{item.description}</p>
                  ) : null}
                  <div className="mt-auto flex items-center justify-between gap-2">
                    {ui.showPrice && item.price !== undefined ? (
                      <span className="text-sm md:text-base font-semibold text-amber-700">{item.price} جنيه</span>
                    ) : null}
                    {item.badge ? (
                      <span className="text-[10px] md:text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-700">
                        {item.badge}
                      </span>
                    ) : null}
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-xl border border-dashed border-slate-300 bg-white/60 p-6 text-center text-sm text-slate-500">
                لا توجد عناصر متاحة الآن.
              </div>
            )}
          </div>
        </div>
      </section>
    </Fragment>
  )
}
