import type {
  BoxElement,
  ButtonElement,
  ColumnElement,
  ColumnsElement,
  CtaGroupElement,
  GridElement,
  ImageElement,
  Page,
  Section,
  StackElement,
  TextElement,
} from "@/types/builder"

// ============================
//   Wahmy Burger Soft UI Theme
// ============================

const WAHMY_PRIMARY = "#FF002B"       // الأحمر الأساسي من الهوية
const WAHMY_PRIMARY_DARK = "#C50021"
const WAHMY_SOFT_BG = "#F5F5F7"       // خلفية سوفت UI
const WAHMY_SURFACE = "#F9FAFB"       // سطح الكروت
const WAHMY_TEXT = "#111827"
const WAHMY_MUTED = "#6B7280"

// ============================
//   HERO SECTION
// ============================

const wahmyHeroMascot: ImageElement = {
  id: "wahmy-hero-mascot",
  type: "image",
  role: "hero-mascot",
  position: 1,
  src: "/images/wahmy/mascot.png", // عدّل حسب المسار عندك
  alt: "وهمي برجر - الماسكوت",
  rounded: true,
  shadow: true,
  width: "220px",
  height: "220px",
  layout: {
    width: "220px",
    margin: "0 auto",
  },
}

const wahmyHeroBurgerImage: ImageElement = {
  id: "wahmy-hero-burger",
  type: "image",
  role: "hero-burger",
  position: 2,
  src: "/images/wahmy/hero-burger.jpg", // صورة برجر هيرو
  alt: "ساندوتش برجر وهمي العملاق",
  rounded: true,
  shadow: true,
  objectFit: "cover",
  width: "100%",
  height: "260px",
  layout: {
    width: "100%",
  },
}

const wahmyHeroImageBox: BoxElement = {
  id: "wahmy-hero-image-box",
  type: "box",
  role: "hero-image-box",
  position: 1,
  direction: "column",
  gap: "1rem",
  layout: {
    width: "100%",
    maxWidth: "420px",
    background: WAHMY_SURFACE,
    rounded: true,
    shadow: true,
    padding: "1.5rem",
  },
  children: [wahmyHeroMascot, wahmyHeroBurgerImage],
}

const wahmyHeroBadge: TextElement = {
  id: "wahmy-hero-badge",
  type: "text",
  role: "badge",
  position: 1,
  text: {
    type: "text",
    value: "طعم من الخيال",
    settings: {
      variant: "heroBadge",
      size: "sm",
      weight: "medium",
      color: WAHMY_PRIMARY,
      background: WAHMY_SOFT_BG,
      rounded: true,
      shadow: true,
      spacingPreset: "tight",
    },
  },
}

const wahmyHeroHeading: TextElement = {
  id: "wahmy-hero-heading",
  type: "text",
  role: "heading",
  position: 2,
  text: {
    type: "text",
    value: "وهمي برجر – ملوك البرجر المشوي",
    settings: {
      variant: "heroHeading",
      size: "xl",
      weight: "extrabold",
      color: WAHMY_TEXT,
      maxWidth: "32rem",
    },
  },
}

const wahmyHeroSubheading: TextElement = {
  id: "wahmy-hero-subheading",
  type: "text",
  role: "subheading",
  position: 3,
  text: {
    type: "text",
    value:
      "ساندوتشات برجر عملاقة، غرقانة جبنة وبطاطس، متشوّية على الفحم عشان تدوق طعم خيالي فعلاً ومن عالم تاني.",
    settings: {
      variant: "heroSubheading",
      size: "md",
      weight: "normal",
      color: WAHMY_MUTED,
      maxWidth: "34rem",
      lineHeight: 1.7,
    },
  },
}

const wahmyHeroPrimary: ButtonElement = {
  id: "wahmy-hero-cta-primary",
  type: "button",
  role: "primary-cta",
  position: 4,
  href: "/menu",
  variant: "primary",
  text: {
    type: "text",
    value: "اطلب البرجر الوهمي دلوقتي",
    settings: {
      variant: "button",
      weight: "medium",
    },
  },
  layout: {
    rounded: true,
    shadow: true,
  },
}

const wahmyHeroSecondary: ButtonElement = {
  id: "wahmy-hero-cta-secondary",
  type: "button",
  role: "secondary-cta",
  position: 5,
  href: "#dash-stats",
  variant: "outline",
  text: {
    type: "text",
    value: "شوف أرقام وهمي",
    settings: {
      variant: "button",
      weight: "normal",
    },
  },
  layout: {
    rounded: true,
    shadow: true,
  },
}

const wahmyHeroCtas: CtaGroupElement = {
  id: "wahmy-hero-cta-group",
  type: "cta-group",
  role: "hero-cta-group",
  position: 6,
  align: "start",
  gap: "0.75rem",
  buttons: [wahmyHeroPrimary, wahmyHeroSecondary],
}

const wahmyHeroContentBox: BoxElement = {
  id: "wahmy-hero-content-box",
  type: "box",
  role: "hero-content-box",
  position: 1,
  direction: "column",
  gap: "0.9rem",
  layout: {
    maxWidth: "34rem",
    background: WAHMY_SURFACE,
    rounded: true,
    shadow: true,
    padding: "1.75rem",
  },
  children: [wahmyHeroBadge, wahmyHeroHeading, wahmyHeroSubheading, wahmyHeroCtas],
}

const wahmyHeroContentCol: ColumnElement = {
  id: "wahmy-hero-col-content",
  type: "column",
  role: "hero-content-column",
  position: 1,
  width: "55%",
  layout: {
    alignSelf: "center",
  },
  children: [wahmyHeroContentBox],
}

const wahmyHeroImageCol: ColumnElement = {
  id: "wahmy-hero-col-image",
  type: "column",
  role: "hero-image-column",
  position: 2,
  width: "45%",
  layout: {
    alignSelf: "center",
  },
  children: [wahmyHeroImageBox],
}

const wahmyHeroColumns: ColumnsElement = {
  id: "wahmy-hero-columns",
  type: "columns",
  role: "hero-layout",
  position: 1,
  gap: "2.5rem",
  layout: {
    width: "100%",
  },
  columns: [wahmyHeroContentCol, wahmyHeroImageCol],
}

export const wahmyHeroSection: Section = {
  id: "section-wahmy-hero",
  type: "hero",
  key: "wahmy-hero-main",
  position: 1,
  layout: {
    container: "xl",
    direction: "column",
    align: "center",
    justify: "center",
    gap: "3rem",
    paddingY: "4rem",
    paddingX: "1.5rem",
    background: WAHMY_SOFT_BG,
  },
  elements: [wahmyHeroColumns],
}

// ============================
//   SIGNATURE BURGERS (Soft Cards)
// ============================

const makeBurgerCard = (
  id: string,
  title: string,
  kcal: string,
  desc: string,
  position: number
): BoxElement => ({
  id,
  type: "box",
  role: "burger-card",
  position,
  layout: {
    background: WAHMY_SURFACE,
    rounded: true,
    shadow: true,
    padding: "1.5rem",
  },
  children: [
    {
      id: `${id}-title`,
      type: "text",
      role: "burger-title",
      position: 1,
      text: {
        type: "text",
        value: title,
        settings: {
          variant: "heroSubheading",
          size: "md",
          weight: "bold",
          color: WAHMY_TEXT,
        },
      },
    } as TextElement,
    {
      id: `${id}-kcal`,
      type: "text",
      role: "burger-kcal",
      position: 2,
      text: {
        type: "text",
        value: kcal,
        settings: {
          variant: "heroBadge",
          size: "sm",
          weight: "medium",
          color: WAHMY_PRIMARY,
          background: WAHMY_SOFT_BG,
          rounded: true,
          spacingPreset: "tight",
        },
      },
    } as TextElement,
    {
      id: `${id}-desc`,
      type: "text",
      role: "burger-desc",
      position: 3,
      text: {
        type: "text",
        value: desc,
        settings: {
          variant: "body",
          size: "sm",
          color: WAHMY_MUTED,
          lineHeight: 1.7,
        },
      },
    } as TextElement,
  ],
})

const wahmyBurgersHeading: TextElement = {
  id: "wahmy-burgers-heading",
  type: "text",
  role: "section-heading",
  position: 1,
  text: {
    type: "text",
    value: "ساندوتشات وهمي المميزة",
    settings: {
      variant: "heroHeading",
      size: "lg",
      weight: "extrabold",
      color: WAHMY_TEXT,
      align: "center",
    },
  },
}

const wahmyBurgersSubheading: TextElement = {
  id: "wahmy-burgers-subheading",
  type: "text",
  role: "section-subheading",
  position: 2,
  text: {
    type: "text",
    value:
      "برجر مشوي على الفحم، جبنة سايحة، فرايز جوّه الساندوتش، وصوصات سرّية عاملة قلبان.",
    settings: {
      variant: "heroSubheading",
      size: "md",
      weight: "normal",
      color: WAHMY_MUTED,
      align: "center",
      maxWidth: "34rem",
      lineHeight: 1.7,
    },
  },
}

const wahmyBurgersGrid: GridElement = {
  id: "wahmy-burgers-grid",
  type: "grid",
  role: "burgers-grid",
  position: 3,
  cols: 1,
  mdCols: 3,
  gap: "1.5rem",
  children: [
    makeBurgerCard(
      "wahmy-burger-space",
      "سبايس سبيس برجر",
      "1160 kcal",
      "برجر لحم مشوي مع جبنتين، حلقات بصل، وصوص سبايسي بطاطس من عالم تاني.",
      1
    ),
    makeBurgerCard(
      "wahmy-burger-mushroom",
      "برجر البيكون والمشروم",
      "1417 kcal",
      "لحم مشوي، مشروم سوتيه، بيكون بيف، وصوص كريمي على الطريقة الوهمية.",
      2
    ),
    makeBurgerCard(
      "wahmy-burger-shrimp",
      "برجر شريمب كرانشي",
      "1160 kcal",
      "برجر جمبري مقرمش مع جبنة وصوص خاص لعشّاق السي فود.",
      3
    ),
  ],
}

export const wahmyBurgersSection: Section = {
  id: "section-wahmy-burgers",
  type: "menu",
  key: "wahmy-signature-burgers",
  position: 2,
  layout: {
    container: "xl",
    direction: "column",
    align: "center",
    justify: "center",
    gap: "1.75rem",
    paddingY: "3rem",
    paddingX: "1.5rem",
    background: WAHMY_SOFT_BG,
  },
  elements: [
    {
      id: "wahmy-burgers-stack",
      type: "stack",
      role: "burgers-heading-stack",
      position: 1,
      gap: "0.5rem",
      align: "center",
      children: [wahmyBurgersHeading, wahmyBurgersSubheading],
    } as StackElement,
    wahmyBurgersGrid,
  ],
}

// ============================
//   DASHBOARD STATS SECTION
// ============================

const statCard = (
  id: string,
  label: string,
  value: string,
  hint: string,
  position: number
): BoxElement => ({
  id,
  type: "box",
  role: "stat-card",
  position,
  layout: {
    background: WAHMY_SURFACE,
    rounded: true,
    shadow: true,
    padding: "1.25rem",
  },
  children: [
    {
      id: `${id}-label`,
      type: "text",
      role: "stat-label",
      position: 1,
      text: {
        type: "text",
        value: label,
        settings: {
          variant: "heroBadge",
          size: "sm",
          weight: "medium",
          color: WAHMY_MUTED,
          spacingPreset: "wide",
        },
      },
    } as TextElement,
    {
      id: `${id}-value`,
      type: "text",
      role: "stat-value",
      position: 2,
      text: {
        type: "text",
        value: value,
        settings: {
          variant: "heroHeading",
          size: "lg",
          weight: "extrabold",
          color: WAHMY_TEXT,
        },
      },
    } as TextElement,
    {
      id: `${id}-hint`,
      type: "text",
      role: "stat-hint",
      position: 3,
      text: {
        type: "text",
        value: hint,
        settings: {
          variant: "body",
          size: "sm",
          color: WAHMY_MUTED,
        },
      },
    } as TextElement,
  ],
})

const wahmyStatsGrid: GridElement = {
  id: "wahmy-stats-grid",
  type: "grid",
  role: "stats-grid",
  position: 2,
  cols: 1,
  mdCols: 4,
  gap: "1.25rem",
  children: [
    statCard("wahmy-stat-branches", "الفروع", "9+", "منتشرين في القاهرة، الجيزة، الساحل ودمياط.", 1),
    statCard("wahmy-stat-rating", "تقييم الناس", "4.5★", "تقييمات عالية على مواقع المطاعم والتطبيقات.", 2),
    statCard("wahmy-stat-views", "زيارات أونلاين", "4.5M+", "مشاهدات منيو وهمي برجر على مواقع المنيو.", 3),
    statCard("wahmy-stat-delivery", "توصيل", "سريع", "أوردرات أونلاين وتوصيل لمناطق كتير.", 4),
  ],
}

const wahmyStatsHeading: TextElement = {
  id: "wahmy-stats-heading",
  type: "text",
  role: "section-heading",
  position: 1,
  text: {
    type: "text",
    value: "DashBoard وهمي – أرقام من عالم تاني",
    settings: {
      variant: "heroHeading",
      size: "lg",
      weight: "extrabold",
      color: WAHMY_TEXT,
      align: "start",
    },
  },
}

export const wahmyStatsSection: Section = {
  id: "dash-stats",
  type: "content",
  key: "wahmy-dashboard-stats",
  position: 3,
  layout: {
    container: "xl",
    direction: "column",
    align: "start",
    justify: "center",
    gap: "1.5rem",
    paddingY: "3rem",
    paddingX: "1.5rem",
    background: WAHMY_SOFT_BG,
  },
  elements: [
    {
      id: "wahmy-stats-heading-box",
      type: "box",
      role: "stats-heading-box",
      position: 1,
      direction: "column",
      gap: "0.25rem",
      children: [wahmyStatsHeading],
    } as BoxElement,
    wahmyStatsGrid,
  ],
}

// ============================
//   BRANCHES + FOOTER
// ============================

const wahmyBranchesText: TextElement = {
  id: "wahmy-branches-text",
  type: "text",
  role: "branches-text",
  position: 1,
  text: {
    type: "text",
    value:
      "وسط البلد – ٦ أكتوبر – الساحل الشمالي – مصر الجديدة – فيصل – ألف مسكن – دمياط – الشيخ زايد – شيراتون.",
    settings: {
      variant: "body",
      size: "sm",
      color: WAHMY_MUTED,
      lineHeight: 1.8,
    },
  },
}

export const wahmyBranchesSection: Section = {
  id: "section-wahmy-branches",
  type: "content",
  key: "wahmy-branches",
  position: 4,
  layout: {
    container: "xl",
    direction: "row",
    align: "center",
    justify: "between",
    gap: "2rem",
    paddingY: "2.5rem",
    paddingX: "1.5rem",
    background: WAHMY_SOFT_BG,
  },
  elements: [
    {
      id: "wahmy-branches-box",
      type: "box",
      role: "branches-box",
      position: 1,
      direction: "column",
      gap: "0.5rem",
      children: [
        {
          id: "wahmy-branches-heading",
          type: "text",
          role: "section-heading",
          position: 1,
          text: {
            type: "text",
            value: "فروع وهمي برجر",
            settings: {
              variant: "heroHeading",
              size: "md",
              weight: "bold",
              color: WAHMY_TEXT,
            },
          },
        } as TextElement,
        wahmyBranchesText,
      ],
    } as BoxElement,
    {
      id: "wahmy-branches-cta",
      type: "box",
      role: "branches-cta",
      position: 2,
      direction: "row",
      align: "center",
      justify: "center",
      children: [
        {
          id: "wahmy-branches-cta-btn",
          type: "button",
          role: "primary",
          position: 1,
          href: "/branches",
          variant: "secondary",
          text: {
            type: "text",
            value: "شوف كل الفروع على الخريطة",
            settings: {
              variant: "button",
              weight: "medium",
            },
          },
          layout: {
            rounded: true,
            shadow: true,
          },
        } as ButtonElement,
      ],
    } as BoxElement,
  ],
}

const wahmyFooterTitle: TextElement = {
  id: "wahmy-footer-title",
  type: "text",
  role: "footer-title",
  position: 1,
  text: {
    type: "text",
    value: "وهمي برجر",
    settings: {
      variant: "heroBadge",
      size: "sm",
      weight: "bold",
      color: WAHMY_PRIMARY,
      spacingPreset: "wide",
    },
  },
}

const wahmyFooterText: TextElement = {
  id: "wahmy-footer-text",
  type: "text",
  role: "footer-text",
  position: 2,
  text: {
    type: "text",
    value: "© 2025 وهمي برجر – طعم من الخيال، برجر من عالم تاني.",
    settings: {
      variant: "body",
      size: "sm",
      color: WAHMY_MUTED,
      align: "center",
    },
  },
}

export const wahmyFooterSection: Section = {
  id: "section-wahmy-footer",
  type: "footer",
  key: "wahmy-footer",
  position: 5,
  layout: {
    container: "xl",
    direction: "column",
    align: "center",
    justify: "center",
    gap: "0.5rem",
    paddingY: "2rem",
    paddingX: "1.5rem",
    background: WAHMY_SOFT_BG,
  },
  elements: [
    {
      id: "wahmy-footer-stack",
      type: "stack",
      role: "footer-stack",
      position: 1,
      gap: "0.25rem",
      align: "center",
      children: [wahmyFooterTitle, wahmyFooterText],
    } as StackElement,
  ],
}
const welatainHomePage: Page = {
  _id: "welatain-home-ar",
  siteId: "welatain-main-site",

  name: "الرئيسية",
  slug: "home",
  language: "ar",

  isPublished: true,
  createdAt: new Date(),
  updatedAt: new Date(),

  seo: {
    title: "ولعتين - برجر وساندوتشات نار بتوصيل سريع",
    description:
      "جرّب برجر ولعتين وسندوتشات الفراخ الكرانشي مع صوصات نار وتوصيل سريع لحد باب بيتك. اطلب أونلاين أو كلمنا مباشرة.",
    keywords: [
      "ولعتين",
      "مطعم ولعتين",
      "برجر",
      "فراخ كرسبي",
      "مطعم في مصر",
      "توصيل أكل",
      "اوردر اونلاين",
    ],
    ogImage: "https://your-cdn.com/welatain/og-hero.jpg",
  },

  sections: [
    // ================
    // 1) Hero Section
    // ================
    {
      id: "section-welatain-hero",
      type: "hero",
      key: "welatain-hero-main",
      position: 1,
      layout: {
        container: "xl",
        direction: "row",
        align: "center",
        justify: "between",
        gap: "2.5rem",
        paddingY: "4rem",
        paddingX: "1.5rem",
        marginBottom: "2.5rem",
        background: "#050814",
        gradient: {
          from: "#111827",
          to: "#020617",
          angle: 135,
        },
        rounded: true,
        shadow: true,
      },
      elements: [
        {
          id: "welatain-hero-columns",
          type: "columns",
          role: "hero-layout",
          position: 1,
          layout: {
            width: "100%",
          },
          gap: "2.5rem",
          align: "center",
          justify: "between",
          stackOnMobile: true,
          columns: [
            // ---- Hero Content Column ----
            {
              id: "welatain-hero-col-content",
              type: "column",
              role: "hero-content-column",
              position: 1,
              width: "52%",
              gap: "1.25rem",
              align: "start",
              justify: "center",
              layout: {
                alignSelf: "stretch",
              },
              children: [
                {
                  id: "welatain-hero-badge",
                  type: "text",
                  role: "badge",
                  position: 1,
                  layout: {
                    alignSelf: "start",
                  },
                  text: {
                    type: "text",
                    value: "🔥 ولعتين - مزاج البرجر و الساندوتشات",
                    settings: {
                      variant: "heroBadge",
                      color: "#fb923c",
                      background: "rgba(15,23,42,0.9)",
                      rounded: true,
                      spacingPreset: "wide",
                    },
                  },
                },
                {
                  id: "welatain-hero-heading",
                  type: "text",
                  role: "heading",
                  position: 2,
                  text: {
                    type: "text",
                    value: "طعم نار،<br/>تجربة ما تتنسيش!",
                    settings: {
                      variant: "heroHeading",
                      color: "#f9fafb",
                      gradient: {
                        from: "#fb923c",
                        to: "#f97316",
                      },
                      spacingPreset: "tight",
                      lineHeight: 1.1,
                    },
                  },
                },
                {
                  id: "welatain-hero-subheading",
                  type: "text",
                  role: "subheading",
                  position: 3,
                  text: {
                    type: "text",
                    value:
                      "برجر عص juicy، فراخ كرانشي، وصوصات على مزاجك. اطلب دلوقتي وهنوصّلك في أسرع وقت، من أقرب فرع ليك.",
                    settings: {
                      variant: "heroSubheading",
                      color: "#e5e7eb",
                      spacingPreset: "normal",
                      lineHeight: 1.6,
                    },
                  },
                },
                {
                  id: "welatain-hero-cta-group",
                  type: "cta-group",
                  role: "hero-cta",
                  position: 4,
                  align: "start",
                  justify: "start",
                  gap: "0.75rem",
                  layout: {
                    margin: "0.75rem 0 0",
                  },
                  buttons: [
                    {
                      id: "welatain-hero-cta-order",
                      type: "button",
                      role: "primary-cta",
                      position: 1,
                      href: "/order",
                      variant: "primary",
                      iconLeft: "🔥",
                      text: {
                        type: "text",
                        value: "اطلب دلوقتي",
                        settings: {
                          variant: "button",
                        },
                      },
                    },
                    {
                      id: "welatain-hero-cta-call",
                      type: "button",
                      role: "secondary-cta",
                      position: 2,
                      href: "tel:01000000000",
                      variant: "outline",
                      iconLeft: "📞",
                      text: {
                        type: "text",
                        value: "اتصل بينا مباشرة",
                        settings: {
                          variant: "button",
                        },
                      },
                    },
                  ],
                },
                {
                  id: "welatain-hero-info-row",
                  type: "row",
                  role: "hero-info-row",
                  position: 5,
                  gap: "1.25rem",
                  align: "center",
                  justify: "start",
                  children: [
                    {
                      id: "welatain-hero-info-delivery",
                      type: "text",
                      role: "meta",
                      position: 1,
                      text: {
                        type: "text",
                        value: "⏱️ توصيل من ٣٠ - ٤٥ دقيقة في أغلب المناطق",
                        settings: {
                          variant: "body",
                          size: "sm",
                          color: "#9ca3af",
                        },
                      },
                    },
                    {
                      id: "welatain-hero-info-payment",
                      type: "text",
                      role: "meta",
                      position: 2,
                      text: {
                        type: "text",
                        value: "💳 كاش أو أونلاين حسب منطقتك",
                        settings: {
                          variant: "body",
                          size: "sm",
                          color: "#9ca3af",
                        },
                      },
                    },
                  ],
                },
              ],
            },
            // ---- Hero Image Column ----
            {
              id: "welatain-hero-col-image",
              type: "column",
              role: "hero-image-column",
              position: 2,
              width: "48%",
              align: "center",
              justify: "center",
              gap: "0.75rem",
              layout: {
                alignSelf: "stretch",
              },
              children: [
                {
                  id: "welatain-hero-main-image",
                  type: "image",
                  role: "hero-image",
                  position: 1,
                  src: "https://your-cdn.com/welatain/hero-burger-platter.jpg",
                  alt: "ساندوتشات ولعتين - برجر و فراخ كرانشي",
                  rounded: true,
                  shadow: true,
                  width: "100%",
                  height: "360px",
                  objectFit: "cover",
                  layout: {
                    background: "#020617",
                  },
                },
                {
                  id: "welatain-hero-small-note",
                  type: "text",
                  role: "meta",
                  position: 2,
                  text: {
                    type: "text",
                    value: "الصور للتوضيح – المنيو بيتحدّث باستمرار بالعروض الجديدة.",
                    settings: {
                      variant: "body",
                      size: "sm",
                      color: "#6b7280",
                      align: "center",
                    },
                  },
                },
              ],
            },
          ],
        },
      ],
    },

    // =====================
    // 2) Why Welatain?
    // =====================
    {
      id: "section-welatain-why",
      type: "content",
      key: "welatain-why-us",
      position: 2,
      layout: {
        container: "xl",
        direction: "column",
        align: "center",
        justify: "center",
        paddingY: "3.5rem",
        paddingX: "1.5rem",
        gap: "2.5rem",
        background: "#0b1120",
        gradient: {
          from: "#020617",
          to: "#111827",
          angle: 180,
        },
        rounded: true,
        shadow: true,
      },
      elements: [
        {
          id: "welatain-why-heading-stack",
          type: "stack",
          role: "section-heading",
          position: 1,
          gap: "0.75rem",
          align: "center",
          children: [
            {
              id: "welatain-why-badge",
              type: "text",
              role: "badge",
              position: 1,
              text: {
                type: "text",
                value: "ليه تختار ولعتين؟",
                settings: {
                  variant: "heroBadge",
                  color: "#f97316",
                  background: "rgba(15,23,42,0.9)",
                  rounded: true,
                },
              },
            },
            {
              id: "welatain-why-title",
              type: "text",
              role: "heading",
              position: 2,
              text: {
                type: "text",
                value: "مش مجرد ساندوتش… هي ولعة مزاج!",
                settings: {
                  variant: "heroSubheading",
                  size: "xl",
                  weight: "bold",
                  color: "#e5e7eb",
                  align: "center",
                },
              },
            },
            {
              id: "welatain-why-description",
              type: "text",
              role: "body",
              position: 3,
              text: {
                type: "text",
                value:
                  "كل أوردر عندنا متحضّر فريش وقت الطلب، بخلطة بهارات خاصة وصوصات متجربة على مزاج الزباين. هدفنا إن كل لقمة تبقى تجربة تستاهل تكررها.",
                settings: {
                  variant: "body",
                  color: "#9ca3af",
                  align: "center",
                  maxWidth: "40rem",
                  lineHeight: 1.7,
                },
              },
            },
          ],
        },
        {
          id: "welatain-why-grid",
          type: "grid",
          role: "features-grid",
          position: 2,
          cols: 1,
          mdCols: 3,
          gap: "1.5rem",
          children: [
            {
              id: "welatain-why-feature-fresh",
              type: "box",
              role: "feature-card",
              position: 1,
              direction: "column",
              gap: "0.5rem",
              align: "start",
              justify: "start",
              layout: {
                padding: "1.25rem 1.25rem",
                background: "rgba(15,23,42,0.85)",
                rounded: true,
                shadow: true,
              },
              children: [
                {
                  id: "welatain-why-feature-fresh-title",
                  type: "text",
                  role: "feature-title",
                  position: 1,
                  text: {
                    type: "text",
                    value: "مكونات فريش و جودة ثابتة",
                    settings: {
                      variant: "body",
                      size: "lg",
                      weight: "bold",
                      color: "#f9fafb",
                    },
                  },
                },
                {
                  id: "welatain-why-feature-fresh-body",
                  type: "text",
                  role: "feature-body",
                  position: 2,
                  text: {
                    type: "text",
                    value:
                      "لحوم ودجاج مختارين بعناية، وتحضير يومي يضمنلك نفس الطعم في كل زيارة أو أوردر.",
                    settings: {
                      variant: "body",
                      color: "#9ca3af",
                    },
                  },
                },
              ],
            },
            {
              id: "welatain-why-feature-sauces",
              type: "box",
              role: "feature-card",
              position: 2,
              direction: "column",
              gap: "0.5rem",
              align: "start",
              justify: "start",
              layout: {
                padding: "1.25rem 1.25rem",
                background: "rgba(15,23,42,0.85)",
                rounded: true,
                shadow: true,
              },
              children: [
                {
                  id: "welatain-why-feature-sauces-title",
                  type: "text",
                  role: "feature-title",
                  position: 1,
                  text: {
                    type: "text",
                    value: "صوصات وخلطات ولعة",
                    settings: {
                      variant: "body",
                      size: "lg",
                      weight: "bold",
                      color: "#f9fafb",
                    },
                  },
                },
                {
                  id: "welatain-why-feature-sauces-body",
                  type: "text",
                  role: "feature-body",
                  position: 2,
                  text: {
                    type: "text",
                    value:
                      "من السبايسي لهادي، اختار مستوى الحرارة اللي يناسب مزاجك مع صوصات مخصوصة لولعتين.",
                    settings: {
                      variant: "body",
                      color: "#9ca3af",
                    },
                  },
                },
              ],
            },
            {
              id: "welatain-why-feature-delivery",
              type: "box",
              role: "feature-card",
              position: 3,
              direction: "column",
              gap: "0.5rem",
              align: "start",
              justify: "start",
              layout: {
                padding: "1.25rem 1.25rem",
                background: "rgba(15,23,42,0.85)",
                rounded: true,
                shadow: true,
              },
              children: [
                {
                  id: "welatain-why-feature-delivery-title",
                  type: "text",
                  role: "feature-title",
                  position: 1,
                  text: {
                    type: "text",
                    value: "توصيل سريع ومنظم",
                    settings: {
                      variant: "body",
                      size: "lg",
                      weight: "bold",
                      color: "#f9fafb",
                    },
                  },
                },
                {
                  id: "welatain-why-feature-delivery-body",
                  type: "text",
                  role: "feature-body",
                  position: 2,
                  text: {
                    type: "text",
                    value:
                      "بنحاول دايمًا نحافظ على سخونة الأكل ووصوله في أقل وقت ممكن، مع تغليف يحافظ على الجودة.",
                    settings: {
                      variant: "body",
                      color: "#9ca3af",
                    },
                  },
                },
              ],
            },
          ],
        },
      ],
    },

    // =====================
    // 3) Menu Teaser
    // =====================
    {
      id: "section-welatain-menu-teaser",
      type: "menu",
      key: "welatain-menu-teaser",
      position: 3,
      layout: {
        container: "xl",
        direction: "column",
        align: "center",
        justify: "center",
        paddingY: "3.5rem",
        paddingX: "1.5rem",
        gap: "2.5rem",
        background: "#020617",
        rounded: true,
        shadow: true,
      },
      elements: [
        {
          id: "welatain-menu-heading-stack",
          type: "stack",
          role: "section-heading",
          position: 1,
          gap: "0.75rem",
          align: "center",
          children: [
            {
              id: "welatain-menu-badge",
              type: "text",
              role: "badge",
              position: 1,
              text: {
                type: "text",
                value: "قائمة الأكلات",
                settings: {
                  variant: "heroBadge",
                  color: "#fb923c",
                  background: "rgba(15,23,42,0.9)",
                  rounded: true,
                },
              },
            },
            {
              id: "welatain-menu-title",
              type: "text",
              role: "heading",
              position: 2,
              text: {
                type: "text",
                value: "ولّعها بأكتر حاجة نفسك فيها",
                settings: {
                  variant: "heroSubheading",
                  size: "xl",
                  weight: "bold",
                  color: "#e5e7eb",
                  align: "center",
                },
              },
            },
            {
              id: "welatain-menu-description",
              type: "text",
              role: "body",
              position: 3,
              text: {
                type: "text",
                value:
                  "برجر لحم، فراخ كرسبي، بوكسات مشاركة، وأطباق جانبية تكمل المزاج. دي نبذة سريعة من المنيو:",
                settings: {
                  variant: "body",
                  color: "#9ca3af",
                  align: "center",
                  maxWidth: "40rem",
                },
              },
            },
          ],
        },
        {
          id: "welatain-menu-grid",
          type: "grid",
          role: "menu-grid",
          position: 2,
          cols: 1,
          mdCols: 3,
          gap: "1.5rem",
          children: [
            {
              id: "welatain-menu-item-burger",
              type: "box",
              role: "menu-card",
              position: 1,
              direction: "column",
              gap: "0.75rem",
              align: "start",
              justify: "start",
              layout: {
                padding: "1.25rem 1.25rem",
                background: "#020617",
                rounded: true,
                shadow: true,
              },
              children: [
                {
                  id: "welatain-menu-item-burger-image",
                  type: "image",
                  role: "menu-image",
                  position: 1,
                  src: "https://your-cdn.com/welatain/menu-burger.jpg",
                  alt: "برجر ولعتين",
                  rounded: true,
                  shadow: true,
                  height: "180px",
                  objectFit: "cover",
                },
                {
                  id: "welatain-menu-item-burger-title",
                  type: "text",
                  role: "menu-title",
                  position: 2,
                  text: {
                    type: "text",
                    value: "برجر ولعتين الكلاسيك",
                    settings: {
                      variant: "body",
                      size: "lg",
                      weight: "bold",
                      color: "#f9fafb",
                    },
                  },
                },
                {
                  id: "welatain-menu-item-burger-body",
                  type: "text",
                  role: "menu-body",
                  position: 3,
                  text: {
                    type: "text",
                    value:
                      "برجر لحم عص juicy مع جبنة، خس، طماطم، وخليط صوص ولعتين المميز.",
                    settings: {
                      variant: "body",
                      color: "#9ca3af",
                    },
                  },
                },
              ],
            },
            {
              id: "welatain-menu-item-chicken",
              type: "box",
              role: "menu-card",
              position: 2,
              direction: "column",
              gap: "0.75rem",
              align: "start",
              justify: "start",
              layout: {
                padding: "1.25rem 1.25rem",
                background: "#020617",
                rounded: true,
                shadow: true,
              },
              children: [
                {
                  id: "welatain-menu-item-chicken-image",
                  type: "image",
                  role: "menu-image",
                  position: 1,
                  src: "https://your-cdn.com/welatain/menu-chicken-crispy.jpg",
                  alt: "ساندوتش فراخ كرانشي",
                  rounded: true,
                  shadow: true,
                  height: "180px",
                  objectFit: "cover",
                },
                {
                  id: "welatain-menu-item-chicken-title",
                  type: "text",
                  role: "menu-title",
                  position: 2,
                  text: {
                    type: "text",
                    value: "ساندوتش الفراخ الكرانشي",
                    settings: {
                      variant: "body",
                      size: "lg",
                      weight: "bold",
                      color: "#f9fafb",
                    },
                  },
                },
                {
                  id: "welatain-menu-item-chicken-body",
                  type: "text",
                  role: "menu-body",
                  position: 3,
                  text: {
                    type: "text",
                    value:
                      "قطع صدور فراخ متبلة ومقلية بقرمشة مميزة، مع خس وصوص سبايسي أو عادي.",
                    settings: {
                      variant: "body",
                      color: "#9ca3af",
                    },
                  },
                },
              ],
            },
            {
              id: "welatain-menu-item-box",
              type: "box",
              role: "menu-card",
              position: 3,
              direction: "column",
              gap: "0.75rem",
              align: "start",
              justify: "start",
              layout: {
                padding: "1.25rem 1.25rem",
                background: "#020617",
                rounded: true,
                shadow: true,
              },
              children: [
                {
                  id: "welatain-menu-item-box-image",
                  type: "image",
                  role: "menu-image",
                  position: 1,
                  src: "https://your-cdn.com/welatain/menu-sharing-box.jpg",
                  alt: "بوكس مشاركة من ولعتين",
                  rounded: true,
                  shadow: true,
                  height: "180px",
                  objectFit: "cover",
                },
                {
                  id: "welatain-menu-item-box-title",
                  type: "text",
                  role: "menu-title",
                  position: 2,
                  text: {
                    type: "text",
                    value: "بوكس العيلة ولعتين",
                    settings: {
                      variant: "body",
                      size: "lg",
                      weight: "bold",
                      color: "#f9fafb",
                    },
                  },
                },
                {
                  id: "welatain-menu-item-box-body",
                  type: "text",
                  role: "menu-body",
                  position: 3,
                  text: {
                    type: "text",
                    value:
                      "تجميعة برجر + فراخ + بطاطس + صوصات كفاية لأكتر من شخص. مثالي للجمعات.",
                    settings: {
                      variant: "body",
                      color: "#9ca3af",
                    },
                  },
                },
              ],
            },
          ],
        },
        {
          id: "welatain-menu-cta-group",
          type: "cta-group",
          role: "menu-cta",
          position: 3,
          align: "center",
          justify: "center",
          gap: "0.75rem",
          buttons: [
            {
              id: "welatain-menu-cta-full-menu",
              type: "button",
              role: "primary-cta",
              position: 1,
              href: "/menu",
              variant: "primary",
              text: {
                type: "text",
                value: "شوف المنيو كامل",
                settings: {
                  variant: "button",
                },
              },
            },
            {
              id: "welatain-menu-cta-offers",
              type: "button",
              role: "secondary-cta",
              position: 2,
              href: "/offers",
              variant: "ghost",
              text: {
                type: "text",
                value: "شوف العروض الحالية",
                settings: {
                  variant: "button",
                },
              },
            },
          ],
        },
      ],
    },

    // =====================
    // 4) Delivery & Contact
    // =====================
    {
      id: "section-welatain-delivery",
      type: "content",
      key: "welatain-delivery-info",
      position: 4,
      layout: {
        container: "xl",
        direction: "row",
        align: "center",
        justify: "between",
        paddingY: "3rem",
        paddingX: "1.5rem",
        gap: "2rem",
        background: "#020617",
        rounded: true,
        shadow: true,
      },
      elements: [
        {
          id: "welatain-delivery-columns",
          type: "columns",
          role: "delivery-columns",
          position: 1,
          gap: "2rem",
          align: "start",
          justify: "between",
          stackOnMobile: true,
          columns: [
            {
              id: "welatain-delivery-col-info",
              type: "column",
              position: 1,
              gap: "0.75rem",
              align: "start",
              justify: "start",
              children: [
                {
                  id: "welatain-delivery-title",
                  type: "text",
                  role: "heading",
                  position: 1,
                  text: {
                    type: "text",
                    value: "التوصيل متاح في منطقتك؟",
                    settings: {
                      variant: "heroSubheading",
                      size: "xl",
                      weight: "bold",
                      color: "#f9fafb",
                    },
                  },
                },
                {
                  id: "welatain-delivery-body",
                  type: "text",
                  role: "body",
                  position: 2,
                  text: {
                    type: "text",
                    value:
                      "غالبًا نغطي مناطق معينة حوالين الفروع. تقدر تطلب مباشرة أو من خلال منصات التوصيل الشركاء (لو متاحة في منطقتك).",
                    settings: {
                      variant: "body",
                      color: "#9ca3af",
                      lineHeight: 1.7,
                    },
                  },
                },
                {
                  id: "welatain-delivery-note",
                  type: "text",
                  role: "meta",
                  position: 3,
                  text: {
                    type: "text",
                    value:
                      "لمعلومات أدق عن مناطق التوصيل، اتصل بينا أو ابعتلنا على واتساب.",
                    settings: {
                      variant: "body",
                      size: "sm",
                      color: "#6b7280",
                    },
                  },
                },
              ],
            },
            {
              id: "welatain-delivery-col-contacts",
              type: "column",
              position: 2,
              gap: "0.75rem",
              align: "start",
              justify: "start",
              children: [
                {
                  id: "welatain-delivery-contact-title",
                  type: "text",
                  role: "heading",
                  position: 1,
                  text: {
                    type: "text",
                    value: "وسائل التواصل والطلب",
                    settings: {
                      variant: "body",
                      size: "lg",
                      weight: "bold",
                      color: "#f9fafb",
                    },
                  },
                },
                {
                  id: "welatain-delivery-contact-body",
                  type: "text",
                  role: "body",
                  position: 2,
                  text: {
                    type: "text",
                    value:
                      "📞 تليفون: 01000000000<br/>💬 واتساب: 01000000000<br/>📱 تابعنا على إنستجرام: @welatain.eg",
                    settings: {
                      variant: "body",
                      color: "#9ca3af",
                    },
                  },
                },
                {
                  id: "welatain-delivery-contact-cta",
                  type: "cta-group",
                  role: "contact-cta",
                  position: 3,
                  align: "start",
                  justify: "start",
                  gap: "0.5rem",
                  buttons: [
                    {
                      id: "welatain-delivery-cta-whatsapp",
                      type: "button",
                      role: "secondary-cta",
                      position: 1,
                      href: "https://wa.me/201000000000",
                      variant: "secondary",
                      iconLeft: "💬",
                      text: {
                        type: "text",
                        value: "راسلنا على واتساب",
                        settings: {
                          variant: "button",
                        },
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },

    // =====================
    // 5) Footer
    // =====================
    {
      id: "section-welatain-footer",
      type: "footer",
      key: "welatain-footer-main",
      position: 5,
      layout: {
        container: "xl",
        direction: "column",
        align: "center",
        justify: "center",
        paddingY: "1.75rem",
        paddingX: "1.5rem",
        background: "#020617",
        rounded: true,
      },
      elements: [
        {
          id: "welatain-footer-text",
          type: "text",
          role: "footer-text",
          position: 1,
          text: {
            type: "text",
            value: "© 2025 ولعتين - كل الحقوق محفوظة.",
            settings: {
              variant: "body",
              size: "sm",
              color: "#6b7280",
              align: "center",
            },
          },
        },
      ],
    },
  ],
}

// ============================
//   PAGE OBJECT
// ============================

export const wahmyHomePage: Page = {
  _id: "page-wahmy-home",
  siteId: "wahmy-burger",
  name: "الرئيسية",
  slug: "home",
  language: "ar",
  sections: [
    wahmyHeroSection,
    wahmyBurgersSection,
    wahmyStatsSection,
    wahmyBranchesSection,
    wahmyFooterSection,
  ],
  isPublished: true,
  createdAt: new Date("2025-01-01T00:00:00.000Z"),
  updatedAt: new Date("2025-06-17T00:00:00.000Z"),
}

// ============================
//   Hadramot Antar Hero Page
// ============================

const hadramotHeroImage: ImageElement = {
  id: "hadramot-hero-image",
  type: "image",
  role: "hero-image",
  position: 1,
  src: "https://hadramotantar.com/hero-main.jpg",
  alt: "حضرموت عنتر - مندي ومشويات",
  rounded: true,
  shadow: true,
  objectFit: "cover",
  width: "100%",
  height: "360px",
  layout: {
    width: "100%",
  },
}

const hadramotHeroImageBox: BoxElement = {
  id: "hadramot-hero-image-box",
  type: "box",
  role: "hero-image-box",
  position: 1,
  layout: {
    width: "100%",
    maxWidth: "420px",
    background: "#FFFFFF",
    rounded: true,
    shadow: true,
    padding: "1rem",
  },
  children: [hadramotHeroImage],
}

const hadramotHeroBadge: TextElement = {
  id: "hadramot-hero-badge",
  type: "text",
  role: "badge",
  position: 1,
  text: {
    type: "text",
    value: "جاهزين لعزومتك اليوم",
    settings: {
      variant: "heroBadge",
      size: "sm",
      weight: "medium",
      color: "#B71C1C",
      transform: "uppercase",
      spacingPreset: "tight",
    },
  },
}

const hadramotHeroHeading: TextElement = {
  id: "hadramot-hero-heading",
  type: "text",
  role: "heading",
  position: 2,
  text: {
    type: "text",
    value: "حضرموت عنتر – أصل المندي في مصر",
    settings: {
      variant: "heroHeading",
      size: "xl",
      weight: "extrabold",
      color: "#1F2933",
      maxWidth: "32rem",
      spacingPreset: "normal",
    },
  },
}

const hadramotHeroSubheading: TextElement = {
  id: "hadramot-hero-subheading",
  type: "text",
  role: "subheading",
  position: 3,
  text: {
    type: "text",
    value:
      "مندي يمني على أصوله، مشويات على الفحم، وصواني عزائم تكفي العيلة والصحاب مع خدمة توصيل سريعة في القاهرة.",
    settings: {
      variant: "heroSubheading",
      size: "md",
      weight: "normal",
      color: "#4B5563",
      maxWidth: "34rem",
      lineHeight: 1.7,
      spacingPreset: "normal",
    },
  },
}

const hadramotHeroPrimary: ButtonElement = {
  id: "hadramot-hero-primary",
  type: "button",
  role: "primary",
  position: 4,
  href: "/menu",
  variant: "primary",
  text: {
    type: "text",
    value: "اطلب أونلاين",
    settings: {
      variant: "button",
      weight: "medium",
      transform: "none",
    },
  },
}

const hadramotHeroSecondary: ButtonElement = {
  id: "hadramot-hero-secondary",
  type: "button",
  role: "secondary",
  position: 5,
  href: "tel:15280",
  variant: "outline",
  text: {
    type: "text",
    value: "اتصل بنا 15280",
    settings: {
      variant: "button",
      weight: "normal",
    },
  },
}

const hadramotHeroCtas: CtaGroupElement = {
  id: "hadramot-hero-cta-group",
  type: "cta-group",
  role: "primary-ctas",
  position: 6,
  align: "start",
  gap: "0.75rem",
  buttons: [hadramotHeroPrimary, hadramotHeroSecondary],
}

const hadramotHeroContent: BoxElement = {
  id: "hadramot-hero-content",
  type: "box",
  role: "hero-content-box",
  position: 1,
  direction: "column",
  gap: "0.75rem",
  layout: {
    maxWidth: "32rem",
  },
  children: [hadramotHeroBadge, hadramotHeroHeading, hadramotHeroSubheading, hadramotHeroCtas],
}

const hadramotHeroImageColumn: ColumnElement = {
  id: "hadramot-hero-image-column",
  type: "column",
  role: "hero-image-column",
  position: 1,
  width: "50%",
  layout: {
    alignSelf: "center",
  },
  children: [hadramotHeroImageBox],
}

const hadramotHeroContentColumn: ColumnElement = {
  id: "hadramot-hero-content-column",
  type: "column",
  role: "hero-content-column",
  position: 2,
  width: "50%",
  layout: {
    alignSelf: "center",
  },
  children: [hadramotHeroContent],
}

const hadramotHeroColumns: ColumnsElement = {
  id: "hadramot-hero-columns",
  type: "columns",
  role: "hero-layout",
  position: 1,
  layout: {
    width: "100%",
  },
  gap: "2.5rem",
  columns: [hadramotHeroImageColumn, hadramotHeroContentColumn],
}

export const hadramotHeroSection: Section = {
  id: "hadramot-hero",
  type: "hero",
  key: "hero-main",
  position: 1,
  layout: {
    container: "xl",
    direction: "column",
    align: "center",
    justify: "center",
    gap: "3rem",
    paddingY: "4rem",
    paddingX: "1.5rem",
    background: "#FFF8E1",
    gradient: {
      from: "#FFF8E1",
      to: "#FFFFFF",
      angle: 180,
    },
  },
  elements: [hadramotHeroColumns],
}

export const hadramotHomePage: Page = {
  _id: "page-hadramot-home",
  siteId: "hadramot-antar",
  name: "الرئيسية",
  slug: "home",
  language: "ar",
  sections: [hadramotHeroSection],
  isPublished: true,
  createdAt: new Date("2024-01-01T00:00:00.000Z"),
  updatedAt: new Date("2024-01-10T00:00:00.000Z"),
}

// ============================
//   Registry + Helpers
// ============================

const builderPages: Record<string, Page> = {
  "wahmy-burger": wahmyHomePage,
  wahmyburger: wahmyHomePage,
  wahmy: wahmyHomePage,
  "hadramot-antar":  welatainHomePage,
  hadramotantar:  welatainHomePage,
}

const tenantAccentMap: Record<string, string> = {
  "wahmy-burger": WAHMY_PRIMARY,
  wahmyburger: WAHMY_PRIMARY,
  wahmy: WAHMY_PRIMARY,
  "hadramot-antar": "#B71C1C",
  hadramotantar: "#B71C1C",
}

export function getTenantBuilderSections(slug: string): Section[] | null {
  if (!slug) return null
  const normalized = slug.toLowerCase()
  const page = builderPages[normalized]
  return page?.sections ?? null
}

export function getTenantAccent(slug: string): string | undefined {
  if (!slug) return undefined
  return tenantAccentMap[slug.toLowerCase()]
}
