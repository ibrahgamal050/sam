// types/builder/page.ts
import type { BuilderTheme, BuilderVersioning, BuilderMeta } from "./core"
import type { Section } from "./elements"

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
