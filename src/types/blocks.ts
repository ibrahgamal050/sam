// apps/meelza-sites/src/types/blocks.ts
export type SectionLayout = {
  container?: "full" | "xl" | "lg" | "md" | "sm"
  direction?: "row" | "column"
  align?: "start" | "center" | "end"
  justify?: "start" | "center" | "end" | "between"
  gap?: string

  paddingY?: string
  paddingX?: string

  background?: string
  gradient?: { from?: string; to?: string; angle?: number }
  rounded?: boolean
  shadow?: boolean

  // Grid mode
  grid?: {
    cols?: number
    mdCols?: number
    lgCols?: number
    gap?: string
  }
}

export type BlockTheme = {
  background?: string
  text?: string
  mutedText?: string
  border?: string
  card?: string
  gradient?: { from?: string; to?: string; angle?: number }
  accent?: string
  ribbon?: string
  badge?: string
  ctaBg?: string
  ctaBgHover?: string
  ctaText?: string
}

export type BlockSpacing = {
  paddingY?: string
  paddingX?: string
  marginY?: string
  container?: "xs" | "sm" | "md" | "lg" | "xl" | "full"
  gap?: string
}

export type Breakpoint = "base" | "sm" | "md" | "lg" | "xl" | "2xl"

export type ResponsiveValue<T> = T | Partial<Record<Breakpoint, T>>

export type LayoutDimension =
  | string
  | number
  | {
      min?: string | number
      value?: string | number
      max?: string | number
    }

export type LayoutSpacingValue =
  | LayoutDimension
  | {
      top?: LayoutDimension
      right?: LayoutDimension
      bottom?: LayoutDimension
      left?: LayoutDimension
    }

export type LayoutPositioning = {
  strategy?: "static" | "relative" | "absolute" | "fixed" | "sticky"
  top?: LayoutDimension
  right?: LayoutDimension
  bottom?: LayoutDimension
  left?: LayoutDimension
  zIndex?: number
}

export type LayoutFlexSettings = {
  direction?: ResponsiveValue<"row" | "row-reverse" | "column" | "column-reverse">
  wrap?: ResponsiveValue<boolean>
  gap?: ResponsiveValue<LayoutDimension>
  align?: ResponsiveValue<"start" | "center" | "end" | "stretch" | "baseline">
  justify?: ResponsiveValue<"start" | "center" | "end" | "space-between" | "space-around" | "space-evenly">
}

export type LayoutGridSettings = {
  columns: string[]
  rows?: string[]
  areas?: string[][]
  gap?: ResponsiveValue<LayoutDimension>
  alignItems?: ResponsiveValue<"start" | "center" | "end" | "stretch">
  justifyItems?: ResponsiveValue<"start" | "center" | "end" | "stretch">
}

export type LayoutFreeSettings = {
  snap?: "pixel" | "grid"
  alignTo?: "canvas" | "section"
}

export type LayoutMode =
  | ({ type: "stack" } & LayoutFlexSettings)
  | ({ type: "grid" } & LayoutGridSettings)
  | ({ type: "free" } & LayoutFreeSettings)

export type LayoutTypography = {
  font?: string
  size?: ResponsiveValue<string | number>
  lineHeight?: ResponsiveValue<string | number>
  letterSpacing?: ResponsiveValue<string | number>
  weight?: ResponsiveValue<"light" | "normal" | "medium" | "semibold" | "bold" | "extrabold">
  casing?: ResponsiveValue<"none" | "uppercase" | "lowercase" | "capitalize">
  align?: ResponsiveValue<"start" | "center" | "end" | "justify">
  color?: string
}

export type LayoutStyleState = {
  background?: string
  borderColor?: string
  textColor?: string
  shadow?: string
  opacity?: number
}

export type LayoutEffects = {
  background?: string
  gradient?: BlockTheme["gradient"]
  border?: {
    color?: string
    width?: string | number
    style?: "solid" | "dashed" | "dotted"
  }
  radius?: ResponsiveValue<string | number>
  shadow?: string
  opacity?: ResponsiveValue<number>
}

export type LayoutBaseElement = {
  id: string
  label?: string
  as?: string
  visible?: ResponsiveValue<boolean>
  layout?: {
    width?: ResponsiveValue<LayoutDimension | "auto">
    height?: ResponsiveValue<LayoutDimension | "auto">
    minWidth?: ResponsiveValue<LayoutDimension>
    maxWidth?: ResponsiveValue<LayoutDimension>
    minHeight?: ResponsiveValue<LayoutDimension>
    maxHeight?: ResponsiveValue<LayoutDimension>
    padding?: LayoutSpacingValue
    margin?: LayoutSpacingValue
    radius?: ResponsiveValue<string | number>
    order?: ResponsiveValue<number>
    alignSelf?: ResponsiveValue<"start" | "center" | "end" | "stretch">
    justifySelf?: ResponsiveValue<"start" | "center" | "end" | "stretch">
    position?: LayoutPositioning
    flexGrow?: ResponsiveValue<number>
    flexShrink?: ResponsiveValue<number>
    flexBasis?: ResponsiveValue<LayoutDimension | "auto">
  }
  effects?: LayoutEffects
  interactions?: {
    hover?: LayoutStyleState
    pressed?: LayoutStyleState
    focus?: LayoutStyleState
  }
  bindings?: Record<string, string | number | boolean>
  children?: LayoutElement[]
}

export type LayoutFrameElement = LayoutBaseElement & {
  kind: "section" | "frame" | "stack" | "container"
  mode?: LayoutMode
  clipContent?: boolean
}

export type LayoutTextElement = LayoutBaseElement & {
  kind: "text"
  text?: string
  typography?: LayoutTypography
}

export type LayoutImageElement = LayoutBaseElement & {
  kind: "image"
  src?: string
  alt?: string
  objectFit?: ResponsiveValue<"cover" | "contain" | "fill" | "none" | "scale-down">
  radius?: ResponsiveValue<string | number>
}

export type LayoutButtonElement = LayoutBaseElement & {
  kind: "button"
  button?: CTAButton
  variant?: "primary" | "secondary" | "ghost" | "outline"
}

export type LayoutElement = LayoutFrameElement | LayoutTextElement | LayoutImageElement | LayoutButtonElement

export type BlockLayoutCanvas = {
  maxWidth?: LayoutDimension
  padding?: LayoutSpacingValue
  align?: "start" | "center" | "stretch"
  background?: string
  gap?: LayoutDimension
  snapToGrid?: boolean
}

export type BlockLayoutSystem = {
  canvas?: BlockLayoutCanvas
  layers: LayoutElement[]
}

export type CTAButton = {
  text: string
  href: string
  variant?: "primary" | "secondary" | "ghost" | "outline"
  icon?: string
  newTab?: boolean
  style?: {
    bgColor?: string
    textColor?: string
    borderColor?: string
  }
}

export type HeadingContent = {
  eyebrow?: string
  title?: string
  subtitle?: string
  align?: "start" | "center" | "end"
}

export type BaseBlock = {
  id?: string
  type: BlockKind
  theme?: BlockTheme
  spacing?: BlockSpacing
  layoutSystem?: BlockLayoutSystem
  className?: string
  dataTestId?: string
}

export type BlockKind =
  | "hero"
  | "text"
  | "image"
  | "story"
  | "menuGrid"
  | "testimonials"
  | "branchesContact"
  | "categoriesStrip"
  | "menuTeaser"
  | "features"
  | "branches"
  | "deliveryInfo"
  | "cta"
  | "chefSection"
  | "timeline"
  | "mapSection"
  | "footer"

export type HeroBlock = BaseBlock & {
  type: "hero"
  title?: string
  heading?: HeadingContent | string
  subtitle?: string
  kicker?: string
  badge?: { text: string; tone?: "accent" | "muted" | "outline" }
  media?: {
    image?: string
    alt?: string
    brightness?: number
    position?: string
  }
  layout?: {
    align?: "start" | "center" | "end"
    height?: "sm" | "md" | "lg" | "full"
    contentWidth?: "narrow" | "normal" | "wide"
    variant?: "gradient" | "solid" | "image"
    overlayOpacity?: number
    showRibbon?: boolean
    mode?: "split" | "fullWidthOverlay"
  }
  ctas?: CTAButton[]
  legacyCta?: { text: string; href: string }
  backgroundImage?: string
  bgAlt?: string
}

export type TextBlock = BaseBlock & {
  type: "text"
  content: string // HTML string جاهز
  heading?: HeadingContent
  align?: "start" | "center" | "end" | "justify"
  size?: "sm" | "md" | "lg" | "xl"
  weight?: "normal" | "medium" | "bold" | "extrabold"
  color?: string
  gradient?: { from?: string; to?: string }
  maxWidth?: string
  spacingPreset?: "tight" | "normal" | "wide"
  background?: string
  shadow?: boolean
  rounded?: boolean
}

export type ImageBlock = BaseBlock & {
  type: "image"
  src: string
  alt?: string
  ratio?: "16/9" | "4/3" | "1/1" | "21/9"
  rounded?: boolean
  shadow?: boolean
  caption?: string
  position?: "left" | "center" | "right"
  bleed?: boolean
  link?: { href: string; newTab?: boolean }
}

export type StoryBlock = BaseBlock & {
  type: "story"
  heading?: HeadingContent
  subheading?: string
  body?: string | string[]
  image?: {
    src: string
    alt?: string
    ratio?: "4/3" | "1/1" | "3/4" | "portrait"
    rounded?: boolean
  }
  images?: {
    src: string
    alt?: string
    width?: number
    height?: number
  }[]
  layout?: "image-left" | "image-right" | "stacked" | "split"
  reverse?: boolean
  ctas?: CTAButton[]
  links?: { label: string; href: string }[]
}

export type MenuGridBlock = BaseBlock & {
  type: "menuGrid"
  heading?: HeadingContent
  columns?: 2 | 3 | 4
  showPrices?: boolean
  cardsVariant?: "soft" | "outline" | "plain"
  items: {
    title: string
    image: string
    href: string
    desc?: string
    price?: string
    badge?: string
  }[]
}

export type TestimonialsBlock = BaseBlock & {
  type: "testimonials"
  heading?: HeadingContent
  layout?: "list" | "carousel" | "grid" | "slider"
  ratingSummary?: {
    average?: number
    totalReviews?: number
    label?: string
  }
  items: {
    quote: string
    author?: string
    role?: string
    rating?: number
  }[]
}

export type BranchesContactBlock = BaseBlock & {
  type: "branchesContact"
  heading?: HeadingContent
  mapEmbedSrc?: string
  layout?: "map-left" | "map-right" | "stacked"
  branches: {
    name: string
    area?: string
    address: string
    phone?: string
    maps?: string
    hours?: string
  }[]
  contact?: {
    email?: string
    phone?: string
    social?: { label: string; href: string }[]
  }
}

export type CategoriesStripBlock = BaseBlock & {
  type: "categoriesStrip"
  heading?: HeadingContent
  layout?: "grid" | "carousel" | "pills"
  categories: Array<{
    id: string
    label: string
    description?: string
    href?: string
    icon?: string
    chipColor?: string
    image?: string
  }>
}

export type MenuTeaserBlock = BaseBlock & {
  type: "menuTeaser"
  heading?: HeadingContent
  highlightStyle?: "cards" | "list" | "badges" | "rows"
  items?: Array<{
    name: string
    description?: string
    badge?: string
    priceLabel?: string
    ctaLabel?: string
    href?: string
    image?: string
  }>
  cta?: CTAButton
  highlightedItems?: MenuTeaserBlock["items"]
}

export type FeaturesBlock = BaseBlock & {
  type: "features"
  heading?: HeadingContent
  layout?: "icons-row" | "grid" | "list"
  intro?: string
  features?: Array<{
    icon?: string
    title: string
    description?: string
  }>
  items?: Array<{
    icon?: string
    title: string
    description?: string
  }>
}

export type BranchesBlock = BaseBlock & {
  type: "branches"
  heading?: HeadingContent
  layout?: "cards" | "list"
  branches: Array<{
    name: string
    address: string
    phone?: string
    areas?: string[]
    openingHours?: string
    pinColor?: string
  }>
  cta?: CTAButton
}

export type DeliveryInfoBlock = BaseBlock & {
  type: "deliveryInfo"
  heading?: HeadingContent
  hotline?: string
  deliveryOptions?: Array<{
    label: string
    description?: string
    icon?: string
  }>
  buttons?: CTAButton[]
  methods?: Array<{
    icon?: string
    title: string
    description?: string
  }>
  note?: string
}

export type CTABlock = BaseBlock & {
  type: "cta"
  heading?: HeadingContent & { note?: string }
  primaryButton?: CTAButton
  secondaryButton?: CTAButton
  cta?: CTAButton
}

export type ChefSectionBlock = BaseBlock & {
  type: "chefSection"
  heading?: HeadingContent
  chef?: {
    name: string
    role?: string
    quote?: string
    image?: string
  }
  highlights?: string[]
}

export type TimelineBlock = BaseBlock & {
  type: "timeline"
  heading?: HeadingContent
  steps: Array<{
    label?: string
    title: string
    description?: string
    icon?: string
  }>
}

export type MapSectionBlock = BaseBlock & {
  type: "mapSection"
  heading?: HeadingContent
  map?: {
    center?: { lat: number; lng: number }
    zoom?: number
    style?: string
  }
  mapEmbedUrl?: string
  branches: Array<{
    name: string
    address: string
    phone?: string
    lat?: number
    lng?: number
    label?: string
    pinColor?: string
  }>
}

export type SocialProofBlock = BaseBlock & {
  type: "socialProof"
  heading?: HeadingContent
  rating?: number
  ratingLabel?: string
  reviewCount?: string
  badges?: string[]
}

export type FooterBlock = BaseBlock & {
  type: "footer"
  brandName?: string
  about?: string
  gradient?: { from?: string; to?: string }
  links?: { label: string; href: string }[]
  follow?: { label: string; href: string }[]
  cta?: CTAButton
  finePrint?: string
}

export type AnyBlock =
  | HeroBlock
  | TextBlock
  | ImageBlock
  | StoryBlock
  | MenuGridBlock
  | TestimonialsBlock
  | BranchesContactBlock
  | CategoriesStripBlock
  | MenuTeaserBlock
  | FeaturesBlock
  | BranchesBlock
  | DeliveryInfoBlock
  | CTABlock
  | SocialProofBlock
  | ChefSectionBlock
  | TimelineBlock
  | MapSectionBlock
  | FooterBlock
