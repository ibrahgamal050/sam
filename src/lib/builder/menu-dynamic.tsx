import { Fragment, type CSSProperties } from "react"
import { cn } from "@/lib/utils"
import { sectionLayoutStyle, elementLayoutClasses } from "./layout"
import { mergeCssRules } from "./responsive"
import type { BuilderRenderOptions, MenuDynamicSection, GridElement } from "./types"
import { MenuDynamicClient } from "./menu-dynamic-client"

/* ---------------------------------------------
 * Tailwind-safe grid-cols (no runtime templates)
 * ------------------------------------------- */
const colsClass = (n?: number) => {
  switch (n) {
    case 1:
      return "grid-cols-1"
    case 2:
      return "grid-cols-2"
    case 3:
      return "grid-cols-3"
    case 4:
      return "grid-cols-4"
    case 5:
      return "grid-cols-5"
    case 6:
      return "grid-cols-6"
    default:
      return "grid-cols-1"
  }
}
const mdColsClass = (n?: number) => {
  switch (n) {
    case 1:
      return "md:grid-cols-1"
    case 2:
      return "md:grid-cols-2"
    case 3:
      return "md:grid-cols-3"
    case 4:
      return "md:grid-cols-4"
    case 5:
      return "md:grid-cols-5"
    case 6:
      return "md:grid-cols-6"
    default:
      return null
  }
}
const lgColsClass = (n?: number) => {
  switch (n) {
    case 1:
      return "lg:grid-cols-1"
    case 2:
      return "lg:grid-cols-2"
    case 3:
      return "lg:grid-cols-3"
    case 4:
      return "lg:grid-cols-4"
    case 5:
      return "lg:grid-cols-5"
    case 6:
      return "lg:grid-cols-6"
    default:
      return null
  }
}

type Locale = "ar" | "en"

const resolveLocale = (value: unknown): Locale => {
  const raw = String(value ?? "ar").toLowerCase()
  return raw.startsWith("en") ? "en" : "ar"
}

const pickLocalized = (v: any, locale: Locale) => {
  if (!v) return ""
  if (typeof v === "string") return v
  if (typeof v === "object") return v?.[locale] ?? v?.ar ?? v?.en ?? ""
  return ""
}

function normalizeMenuToItems(menuData: any, localeInput: unknown = "ar") {
  const locale = resolveLocale(localeInput)

  const categories = Array.isArray(menuData?.categories) ? menuData.categories : []
  const out: any[] = []

  for (const cat of categories) {
    const categoryId = String(cat?._id ?? cat?.id ?? "")
    const categoryName = pickLocalized(cat?.name, locale)
    const categoryDescription = pickLocalized(cat?.description, locale)
    const categoryImage = cat?.image

    const items = Array.isArray(cat?.menuItems) ? cat.menuItems : []
    items.forEach((it: any, idx: number) => {
      const name = pickLocalized(it?.name, locale)
      const description = pickLocalized(it?.description, locale)

      const sizePrices = Array.isArray(it?.sizes)
        ? it.sizes.map((s: any) => s?.price).filter((p: any) => typeof p === "number")
        : []

      const price =
        typeof it?.price === "number"
          ? it.price
          : sizePrices.length
            ? Math.min(...sizePrices)
            : undefined

      out.push({
        _id: it?._id,
        id: String(it?._id ?? it?.id ?? `${categoryId}-${idx}`),

        name,
        description,
        price,
        image: it?.image,
        isAvailable: it?.isAvailable ?? true,
        stock: it?.stock ?? null,
        sizes: it?.sizes ?? [],

        categoryId,
        categoryName,
        categoryDescription,
        categoryImage,

        tags: Array.isArray(it?.tags) ? it.tags : [],
        position: typeof it?.position === "number" ? it.position : idx,
        badge: it?.badge,
      })
    })
  }

  return out
}

/* ---------------------------------------------
 * Group helper (outside render)
 * ------------------------------------------- */
function groupByCategory(list: any[]) {
  const order: string[] = []
  const map = new Map<string, { id: string; name: string; items: any[] }>()

  for (const it of list) {
    const id = String(it.categoryId ?? "unknown")
    const nameRaw = String(it.categoryName ?? "").trim()
    const name = nameRaw || "قسم"

    if (!map.has(id)) {
      map.set(id, { id, name, items: [] })
      order.push(id)
    }
    map.get(id)!.items.push(it)
  }

  return order.map((id) => map.get(id)!).filter(Boolean)
}

function resolveSectionTitle(rawTitle: any, locale: Locale) {
  if (!rawTitle) return null
  if (typeof rawTitle === "string") return rawTitle
  if (typeof rawTitle === "object") return rawTitle?.[locale] ?? rawTitle?.ar ?? rawTitle?.en ?? null
  return null
}

/* ---------------------------------------------
 * Main renderer (Server)
 * ------------------------------------------- */
export const renderMenuDynamic = (
  section: MenuDynamicSection,
  sectionContext: BuilderRenderOptions,
  contentClasses: string,
  contentStyle: CSSProperties,
  wrapperClasses: string,
  wrapperStyle: CSSProperties,
  combinedCss?: string,
) => {
  const rawLocale = String(sectionContext.locale ?? "ar").toLowerCase()
const locale: Locale = rawLocale.startsWith("en") ? "en" : "ar"

const rawMenu = sectionContext.dataSources?.menu as any
const maybeMenuItems = (sectionContext.dataSources as any)?.menuItems as any[] | undefined

const menuItemsAreSafe =
  Array.isArray(maybeMenuItems) &&
  maybeMenuItems.length > 0 &&
  typeof maybeMenuItems[0]?.categoryName === "string" &&
  maybeMenuItems[0].categoryName.trim().length > 0

const items = menuItemsAreSafe
  ? maybeMenuItems
  : rawMenu
    ? normalizeMenuToItems(rawMenu, locale)
    : []



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

  const catFromUrl = (() => {
    const v = sectionContext.searchParams?.cat
    return typeof v === "string" ? v : undefined
  })()

  const data: MenuDynamicSection["data"] = {
    source: legacyData.source ?? config.source ?? "menu",
    categoryId: legacyData.categoryId ?? (catFromUrl ? String(catFromUrl) : undefined),
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
    cardVariant: (legacyUi as any).cardVariant ?? config.ui?.cardVariant ?? "simple",

    // ✅ NEW: show sticky headers?
    showCategoryTitle: (legacyUi as any).showCategoryTitle ?? true,
    stickyCategoryTitle: (legacyUi as any).stickyCategoryTitle ?? true,
    stickyTop: (legacyUi as any).stickyTop ?? "top-16 md:top-20",
  } as any

  // Filters
  const categoriesFilter: string[] = []
  if (data.categoryId) categoriesFilter.push(String(data.categoryId))
  if (Array.isArray(config.filters?.categoriesAny)) categoriesFilter.push(...config.filters.categoriesAny.map(String))

  const tagsFilter = data.tags ?? []
  const tagsAny = Array.isArray(config.filters?.tagsAny) ? config.filters.tagsAny : []
  const tagsAll = Array.isArray(config.filters?.tagsAll) ? config.filters.tagsAll : []
  const anyTagsArr = tagsFilter.length ? tagsFilter : tagsAny

  let filtered = items.slice()

  if (categoriesFilter.length) {
    filtered = filtered.filter((item) => {
      const catId = item.categoryId ? String(item.categoryId) : ""
      const catName = item.categoryName ? String(item.categoryName) : ""
      return categoriesFilter.includes(catId) || categoriesFilter.includes(catName)
    })
  }

  if (anyTagsArr.length || tagsAll.length) {
    filtered = filtered.filter((item) => {
      const itemTags = Array.isArray(item.tags) ? item.tags : []
      const mustHaveSomeTags = anyTagsArr.length > 0 || tagsAll.length > 0
      if (mustHaveSomeTags && itemTags.length === 0) return false

      const matchesAny = anyTagsArr.length ? anyTagsArr.some((t) => itemTags.includes(t)) : true
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
      filtered.sort((a, b) => String(a.name || "").localeCompare(String(b.name || "")))
      break
    default:
      filtered.sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
  }

  if (data.limit && filtered.length > data.limit) filtered = filtered.slice(0, data.limit)

  // Layout styles
  const layoutResult = section.layout ? sectionLayoutStyle(section.id, section.layout) : { style: {} as CSSProperties }
  const mergedWrapperStyle = { ...wrapperStyle, ...layoutResult.style }
  const mergedCss = mergeCssRules(combinedCss, layoutResult.css)

  const gridElement = Array.isArray(section.elements)
    ? (section.elements.find((el) => el.type === "grid") as GridElement | undefined)
    : undefined
  const gridLayoutClasses = gridElement ? elementLayoutClasses(gridElement.layout) : null

  const cols = ui.cols ?? { base: 1, md: 2, lg: 3 }
  const gridClasses = cn(
    "grid w-full gap-4 md:gap-6",
    colsClass(cols.base ?? 1),
    mdColsClass(cols.md),
    lgColsClass(cols.lg),
  )

  const imageRatio = (config.ui?.imageRatio as string | undefined) ?? "4 / 3"
  const aspectRatio = imageRatio.includes("/") ? imageRatio.replace("/", " / ") : imageRatio

  const variant = ((ui as any).cardVariant as "simple" | "add" | "stepper") ?? "simple"
  const gridClassName = cn(gridClasses, gridLayoutClasses)

  const sectionTitle = resolveSectionTitle((section as any).title ?? config?.title, locale)

  // ✅ groups payload للـ client (بدون functions)
  const rawGroups = groupByCategory(filtered)

  const groups = rawGroups
    .map((group) => ({
      id: group.id,
      title: group.name || "قسم",
      items: group.items.map((item) => ({
        id: String(item._id ?? item.id ?? `${item.categoryId ?? "cat"}-${item.position ?? 0}`),
        name: item.name ?? "",
        description: item.description,
        price: ui.showPrice !== false ? item.price : undefined,
        image: ui.showImage !== false ? item.image : undefined,
      })),
    }))
    .filter((g) => g.items.length > 0)

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
          {sectionTitle ? (
            <div className="mb-4">
              <h2 className="text-2xl font-extrabold text-slate-900 md:text-3xl">{sectionTitle}</h2>
            </div>
          ) : null}

          <MenuDynamicClient
            groups={groups}
            variant={variant}
            gridClasses={gridClassName}
            aspectRatio={aspectRatio}
            cardStyle={ui.cardStyle}
            emptyLabel="لا توجد عناصر متاحة الآن."
            showCategoryTitle={(ui as any).showCategoryTitle}
            stickyCategoryTitle={(ui as any).stickyCategoryTitle}
            stickyTopClass={(ui as any).stickyTop}
          />
        </div>
      </section>
    </Fragment>
  )
}
