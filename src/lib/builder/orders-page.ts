import type { BuilderTheme, Section } from "./types"

export const DEFAULT_ORDERS_THEME: BuilderTheme = {
  palette: {
    primary: "#6c5ce7",
    accent: "#ff5c2b",
    text: "#111827",
    muted: "#6b7280",
    success: "#16a34a",
    warning: "#f59e0b",
    danger: "#ef4444",
  },
  typography: {
    heading: "Cairo, sans-serif",
    body: "Cairo, sans-serif",
  },
  radii: {
    large: "24px",
    medium: "16px",
    small: "12px",
  },
}

export const DEFAULT_ORDERS_SECTIONS: Section[] = [
  {
    id: "orders-hero",
    type: "content",
    position: 1,
    layout: {
      container: "page",
      paddingY: "32px",
      gap: "12px",
    },
    elements: [
      {
        id: "orders-hero-title",
        type: "text",
        position: 1,
        text: {
          type: "text",
          value: "طلباتي",
          settings: { variant: "heroHeading" },
        },
      },
      {
        id: "orders-hero-sub",
        type: "text",
        position: 2,
        text: {
          type: "text",
          value: "تابع طلباتك الأخيرة وحالتها مع إمكانية تغيير الثيم والترتيب من الـ Builder.",
          settings: { variant: "body", color: "#6b7280" },
        },
      },
    ],
  },
  {
    id: "orders-list-section",
    type: "orders-shell",
    position: 2,
    layout: {
      container: "page",
      paddingY: "16px",
    },
    elements: [],
    data: {
      title: "قائمة الطلبات",
      subtitle: "يتم جلب البيانات من الـ Binding (orders) تلقائياً.",
    },
  },
]
