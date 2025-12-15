import type { Section } from "@/types/builder"

const isSectionArray = (value: unknown): value is Section[] => {
  if (!Array.isArray(value)) return false
  return value.every((section) => !!section && typeof section === "object" && "type" in section)
}

export const readBuilderSections = (value: unknown): Section[] | null => {
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value)
      if (isSectionArray(parsed)) return parsed
    } catch {
      return null
    }
  }

  if (isSectionArray(value)) return value

  return null
}

export const getPageBuilderSections = (page: unknown): Section[] | null => {
  if (!page || typeof page !== "object" || !("sections" in page)) {
    return null
  }
  return readBuilderSections((page as { sections?: unknown }).sections)
}

export const sortSections = (sections: Section[]): Section[] => {
  return sections.slice().sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
}
