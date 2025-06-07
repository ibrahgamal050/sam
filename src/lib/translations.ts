import "server-only"

const dictionaries = {
  en: () => import("@/translations/en.json").then((module) => module.default),
  ar: () => import("@/translations/ar.json").then((module) => module.default),
}

export type Locale = keyof typeof dictionaries

export const getTranslations = async (locale: Locale) => {
  try {
    return await dictionaries[locale]()
  } catch (error) {
    console.error(`Failed to load translations for locale: ${locale}`, error)
    // Fallback to English if the requested locale fails to load
    return await dictionaries.en()
  }
}
