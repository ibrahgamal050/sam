"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

type Language = "en" | "ar"
type Direction = "ltr" | "rtl"

interface Translations {
  [key: string]: {
    en: string
    ar: string
  }
}

interface LanguageContextType {
  language: Language
  direction: Direction
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

// Common translations used across the app
const translations: Translations = {
  categories: {
    en: "Categories",
    ar: "الفئات",
  },
  viewAll: {
    en: "View All",
    ar: "عرض الكل",
  },
  noCategories: {
    en: "No Categories Available",
    ar: "لا توجد فئات متاحة",
  },
  noCategoriesDesc: {
    en: "This restaurant hasn't added any menu categories yet.",
    ar: "لم تضف هذه المطعم أي فئات قائمة حتى الآن.",
  },
  todaysSpecial: {
    en: "Today's Special",
    ar: "عرض اليوم",
  },
  featured: {
    en: "Featured",
    ar: "مميز",
  },
  viewDetails: {
    en: "View Details",
    ar: "عرض التفاصيل",
  },
  about: {
    en: "About",
    ar: "حول",
  },
  learnMore: {
    en: "Learn More",
    ar: "اقرأ المزيد",
  },
  openHours: {
    en: "Open Hours",
    ar: "ساعات العمل",
  },
  error: {
    en: "Error",
    ar: "خطأ",
  },
  tryAgain: {
    en: "Try again",
    ar: "حاول مرة أخرى",
  },
  restaurantNotFound: {
    en: "Restaurant not found",
    ar: "لم يتم العثور على المطعم",
  },
  restaurantNotFoundDesc: {
    en: "We couldn't find the restaurant you're looking for.",
    ar: "لم نتمكن من العثور على المطعم الذي تبحث عنه.",
  },
  defaultDescription: {
    en: "Welcome to our restaurant. We serve delicious food with great service.",
    ar: "مرحبًا بكم في مطعمنا. نقدم طعامًا لذيذًا مع خدمة رائعة.",
  },
  defaultSpecialDesc: {
    en: "A delicious special prepared by our chefs.",
    ar: "طبق خاص لذيذ من إعداد طهاتنا.",
  },
  contactForHours: {
    en: "Please contact us for hours",
    ar: "يرجى الاتصال بنا لمعرفة ساعات العمل",
  },
}

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  direction: "ltr",
  setLanguage: () => {},
  t: (key) => key,
})

export const useLanguage = () => useContext(LanguageContext)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en")
  const [direction, setDirection] = useState<Direction>("ltr")

  // Function to translate text
  const t = (key: string): string => {
    if (translations[key] && translations[key][language]) {
      return translations[key][language]
    }
    // Fallback to the key if translation not found
    return key
  }

  // Update language and direction
  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem("preferredLanguage", lang)
    setDirection(lang === "ar" ? "rtl" : "ltr")

    // Update HTML dir attribute
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr"
    document.documentElement.lang = lang
  }

  // Initialize language from localStorage or browser preference
  useEffect(() => {
    const savedLanguage = localStorage.getItem("preferredLanguage") as Language | null

    if (savedLanguage && (savedLanguage === "en" || savedLanguage === "ar")) {
      setLanguage(savedLanguage)
    } else {
      // Check browser language
      const browserLang = navigator.language.split("-")[0]
      if (browserLang === "ar") {
        setLanguage("ar")
      }
    }
  }, [])

  return <LanguageContext.Provider value={{ language, direction, setLanguage, t }}>{children}</LanguageContext.Provider>
}
