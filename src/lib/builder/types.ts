// src/lib/builder/types.ts

export type Breakpoint = "base" | "sm" | "md" | "lg" | "xl"

export type ResponsiveValue<T> = T | Partial<Record<Breakpoint, T>>

export interface ThemePalette {
  primary?: string
  secondary?: string
  accent?: string
  text?: string
  muted?: string
  background?: string
}

export interface ThemeTypography {
  heading?: string
  body?: string
}

export interface ThemeRadii {
  large?: string
  medium?: string
  small?: string
}

export interface ThemeShadows {
  soft?: string
  bold?: string
}

export interface BuilderTheme {
  palette?: ThemePalette
  typography?: ThemeTypography
  radii?: ThemeRadii
  shadows?: ThemeShadows
}

export type DataBindingSource = "menu" | "branches" | "offers" | "cms" | "custom" | string

export type DataBindingTransform = "uppercase" | "lowercase" | "capitalize" | "trim"
export type DataBindingFormat = "plain" | "html" | "url" | "image"

export interface DataBindingConfig {
  source: DataBindingSource
  path?: string
  pick?: number | string
  filter?: Record<string, unknown>
  slice?: { offset?: number; limit?: number }
  transform?: DataBindingTransform
  format?: DataBindingFormat
  fallback?: string
}

export interface BuilderMeta {
  createdBy?: string
  updatedBy?: string
  tags?: string[]
  notes?: string
  thumbnailUrl?: string
  deviceTargets?: Array<"mobile" | "tablet" | "desktop">
}

export interface BuilderVersionEntry {
  version: number
  notes?: string
  updatedBy?: string
  updatedAt: Date | string
}

export interface BuilderVersioning {
  current: number
  history?: BuilderVersionEntry[]
}

export interface BuilderDataSources {
  menu?: unknown
  branches?: unknown
  offers?: unknown
  cms?: Record<string, unknown>
  [key: string]: unknown
}

export interface BuilderRenderOptions {
  theme?: BuilderTheme
  dataSources?: BuilderDataSources
  locale?: string
}

export type LanguageCode = "ar" | "en"

export interface SEO {
  title?: string
  description?: string
  keywords?: string[]
  ogImage?: string
}

export interface Page {
  _id: string
  siteId: string
  name: string
  slug: string
  language: LanguageCode
  sections: Section[]
  seo?: SEO
  theme?: BuilderTheme
  versioning?: BuilderVersioning
  meta?: BuilderMeta
  isPublished: boolean
  createdAt: Date
  updatedAt: Date
}

export type SectionType =
  | "hero"
  | "content"
  | "menu"
  | "menu-dynamic"
  | "gallery"
  | "bio"
  | "footer"
  | "branches"
  | "story"
  | "mission-values"
  | "process"
  | "team"
  | "cta"
  | "testimonials"
  | "faq"
  | "custom"

export type SectionContainer = "full" | "xl" | "lg" | "md" | "sm" | "page"

export type AlignValue = "start" | "center" | "end" | "stretch"
export type JustifyValue = "start" | "center" | "end" | "between"

export interface SectionLayout {
  container?: SectionContainer
  direction?: ResponsiveValue<"row" | "column">
  align?: ResponsiveValue<AlignValue>
  justify?: ResponsiveValue<JustifyValue>
  gap?: ResponsiveValue<string>
  paddingY?: ResponsiveValue<string>
  paddingX?: ResponsiveValue<string>
  marginTop?: ResponsiveValue<string>
  marginBottom?: ResponsiveValue<string>
  background?: ResponsiveValue<string>
  gradient?: { from?: string; to?: string; angle?: number }
  rounded?: boolean
  shadow?: boolean
  grid?: {
    cols?: ResponsiveValue<number>
    mdCols?: number
    lgCols?: number
    gap?: ResponsiveValue<string>
  }
}

export interface Section {
  id: string
  type: SectionType
  key?: string
  position: number
  layout?: SectionLayout
  theme?: BuilderTheme
  dataBinding?: DataBindingConfig
  // اختياري لسكاشن ديناميكية
  data?: Record<string, unknown>
  ui?: Record<string, unknown>
  elements: Element[]
}

export interface MenuDynamicSection extends Section {
  type: "menu-dynamic"
  data: {
    source: DataBindingSource
    categoryId?: string | null
    tags?: string[]
    limit?: number
    sort?: "position" | "price-asc" | "price-desc" | "name"
    showOnlyAvailable?: boolean
  }
  ui: {
    layout: "grid" | "list" | "carousel"
    cols?: { base?: number; md?: number; lg?: number }
    showImage?: boolean
    showPrice?: boolean
    showCalories?: boolean
    cardStyle?: "soft" | "outlined" | "flat"
  }
}

export interface ElementLayout {
  alignSelf?: ResponsiveValue<"start" | "center" | "end" | "stretch">
  justifySelf?: ResponsiveValue<"start" | "center" | "end">
  width?: ResponsiveValue<string>
  maxWidth?: ResponsiveValue<string>
  padding?: ResponsiveValue<string>
  margin?: ResponsiveValue<string>
  order?: ResponsiveValue<number>
  background?: ResponsiveValue<string>
  rounded?: boolean
  shadow?: boolean
  position?: "relative" | "absolute"
  top?: ResponsiveValue<string>
  right?: ResponsiveValue<string>
  bottom?: ResponsiveValue<string>
  left?: ResponsiveValue<string>
  zIndex?: ResponsiveValue<number>
}

export interface ElementBase {
  id: string
  type: ElementType
  role?: string
  position: number
  layout?: ElementLayout
  theme?: BuilderTheme
  dataBinding?: DataBindingConfig
}

export type ElementType =
  | "text"
  | "image"
  | "button"
  | "cta-group"
  | "row"
  | "stack"
  | "box"
  | "columns"
  | "column"
  | "grid"
  | "menu-item-card"
  | "branch-card"
  | "social-links"
  | "rating-badge"

export type TextAlign = "start" | "center" | "end" | "justify"
export type TextSize = "sm" | "md" | "lg" | "xl"
export type TextWeight = "normal" | "medium" | "bold" | "extrabold"
export type TextVariant =
  | "heroHeading"
  | "heroSubheading"
  | "heroBadge"
  | "sectionHeading"
  | "body"
  | "button"
export type TextTransform = "none" | "uppercase" | "lowercase" | "capitalize"
export type SpacingPreset = "tight" | "normal" | "wide"

export interface TextSettings {
  variant?: TextVariant
  align?: TextAlign
  size?: TextSize
  weight?: TextWeight
  color?: string
  gradient?: { from?: string; to?: string }
  maxWidth?: string
  lineHeight?: number
  transform?: TextTransform
  italic?: boolean
  underline?: boolean
  background?: string
  shadow?: boolean
  rounded?: boolean
  spacingPreset?: SpacingPreset
}

export interface TextContent {
  type: "text"
  value: string
  settings?: TextSettings
  binding?: DataBindingConfig
}

export interface TextElement extends ElementBase {
  type: "text"
  text: TextContent
}

export interface ImageElement extends ElementBase {
  type: "image"
  src: string
  alt?: string
  srcBinding?: DataBindingConfig
  altBinding?: DataBindingConfig
  rounded?: boolean
  shadow?: boolean
  width?: string
  height?: string
  objectFit?: "cover" | "contain"
  ratio?: string
}

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost"

export interface ButtonElement extends ElementBase {
  type: "button"
  text: TextContent
  href: string
  hrefBinding?: DataBindingConfig
  variant?: ButtonVariant
  iconLeft?: string
  iconRight?: string
}

export interface CtaGroupElement extends ElementBase {
  type: "cta-group"
  align?: ResponsiveValue<AlignValue>
  justify?: ResponsiveValue<JustifyValue>
  gap?: ResponsiveValue<string>
  buttons: ButtonElement[]
}

export interface RowElement extends ElementBase {
  type: "row"
  gap?: ResponsiveValue<string>
  align?: ResponsiveValue<AlignValue>
  justify?: ResponsiveValue<JustifyValue>
  wrap?: boolean
  children: Element[]
}

export interface StackElement extends ElementBase {
  type: "stack"
  gap?: ResponsiveValue<string>
  align?: ResponsiveValue<AlignValue>
  children: Element[]
}

export interface BoxElement extends ElementBase {
  type: "box"
  direction?: ResponsiveValue<"row" | "column">
  gap?: ResponsiveValue<string>
  align?: ResponsiveValue<AlignValue>
  justify?: ResponsiveValue<JustifyValue>
  wrap?: boolean
  children: Element[]
}

export interface ColumnElement extends ElementBase {
  type: "column"
  children: Element[]
  width?: string
  gap?: ResponsiveValue<string>
  align?: ResponsiveValue<AlignValue>
  justify?: ResponsiveValue<JustifyValue>
}

export interface ColumnsElement extends ElementBase {
  type: "columns"
  cols?: ResponsiveValue<number>
  gap?: ResponsiveValue<string>
  columns?: ColumnElement[]
  items?: Element[]
  align?: ResponsiveValue<AlignValue>
  justify?: ResponsiveValue<JustifyValue>
  stackOnMobile?: boolean
}

export interface GridElement extends ElementBase {
  type: "grid"
  cols?: ResponsiveValue<number>
  mdCols?: number
  lgCols?: number
  gap?: ResponsiveValue<string>
  children: Element[]
}

export interface MenuItemCardElement extends ElementBase {
  type: "menu-item-card"
  itemId?: string
  showImage?: boolean
  showPrice?: boolean
  showDescription?: boolean
  showBadge?: boolean
  imageHeight?: string
}

export interface BranchCardElement extends ElementBase {
  type: "branch-card"
  branchId?: string
  showAddress?: boolean
  showPhone?: boolean
}

export interface SocialLinksElement extends ElementBase {
  type: "social-links"
  align?: ResponsiveValue<AlignValue>
  gap?: ResponsiveValue<string>
  links: Array<{ label: string; href: string; icon?: string }>
}

export interface RatingBadgeElement extends ElementBase {
  type: "rating-badge"
  value?: number
  max?: number
  label?: string
}

export interface BadgeElement extends ElementBase {
  type: "badge"
  badge?: {
    value?: string
    settings?: {
      variant?: "solid" | "outline"
      color?: string
      textColor?: string
      align?: TextAlign
    }
  }
}

export interface ButtonsElement extends ElementBase {
  type: "buttons"
  buttons?: {
    align?: ResponsiveValue<AlignValue>
    items?: Array<{
      label?: string
      href?: string
      variant?: ButtonVariant
      iconLeft?: string
      iconRight?: string
    }>
  }
}

export interface TimelineElement extends ElementBase {
  type: "timeline"
  timeline?: {
    items?: Array<{
      title?: string
      text?: string
    }>
  }
}

export interface CardElement extends ElementBase {
  type: "card"
  card?: {
    title?: string
    text?: string
    icon?: string
    theme?: {
      bg?: string
      text?: string
    }
  }
}

export type Element =
  | TextElement
  | ImageElement
  | ButtonElement
  | CtaGroupElement
  | RowElement
  | StackElement
  | BoxElement
  | ColumnElement
  | ColumnsElement
  | GridElement
  | MenuItemCardElement
  | BranchCardElement
  | SocialLinksElement
  | RatingBadgeElement
  | BadgeElement
  | ButtonsElement
  | TimelineElement
  | CardElement
  | CarouselElement
  | AccordionElement

export interface CarouselElement extends ElementBase {
  type: "carousel"
  carousel?: {
    items?: Array<{
      title?: string
      text?: string
      name?: string
    }>
  }
}

export interface AccordionElement extends ElementBase {
  type: "accordion"
  accordion?: {
    items?: Array<{
      q?: string
      a?: string
    }>
  }
}
