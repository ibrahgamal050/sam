// types/builder/elements.ts
import type {
  ResponsiveValue,
  BuilderTheme,
  DataBindingConfig,
} from "./core"

export type SectionType = "hero" | "content" | "menu" | "gallery" | "bio" | "footer" | "custom"

export type SectionContainer = "full" | "xl" | "lg" | "md" | "sm"

type AlignValue = "start" | "center" | "end" | "stretch"
type JustifyValue = "start" | "center" | "end" | "between"

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
  elements: Element[]
}

// ElementLayout, ElementBase, TextSettings, TextElement, ImageElement, ButtonElement, ...
// ثم:
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
