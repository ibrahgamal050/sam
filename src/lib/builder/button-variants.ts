import type { ButtonVariant } from "./types"

export type ButtonVariantGroup = "core" | "brand" | "behavior" | "restaurant"

export interface ButtonVariantDefinition {
  id: ButtonVariant
  group: ButtonVariantGroup
  label: string
  description?: string
  recommendedFor?: string[]
  seoFriendly?: boolean
  ctaWeight?: "primary" | "secondary" | "supporting"
  defaultIconPosition?: "left" | "right" | "only" | "none"
}

export const BUTTON_VARIANTS: ButtonVariantDefinition[] = [
  { id: "primary", group: "core", label: "Primary", description: "Main CTA (order, reserve, add to cart)", ctaWeight: "primary" },
  { id: "secondary", group: "core", label: "Secondary", description: "Secondary CTA (menu, branches)", ctaWeight: "secondary" },
  { id: "ghost", group: "core", label: "Ghost", description: "Low emphasis navigation/action", ctaWeight: "supporting" },
  { id: "link", group: "core", label: "Link", description: "Inline SEO-friendly navigation", seoFriendly: true, ctaWeight: "supporting" },

  { id: "solid-dark", group: "brand", label: "Solid Dark", description: "High-contrast on light sections" },
  { id: "solid-light", group: "brand", label: "Solid Light", description: "White button for dark hero/CTA" },
  { id: "outline", group: "brand", label: "Outline", description: "Border-only for calm/SEO sections" },
  { id: "gradient", group: "brand", label: "Gradient", description: "Hero / final CTA highlight" },
  { id: "danger", group: "brand", label: "Danger", description: "Destructive actions" },
  { id: "success", group: "brand", label: "Success", description: "Confirmation / positive status" },

  { id: "icon", group: "behavior", label: "Icon Only", description: "Floating / compact icon action", defaultIconPosition: "only" },
  { id: "icon-left", group: "behavior", label: "Icon Left", description: "Icon before text", defaultIconPosition: "left" },
  { id: "icon-right", group: "behavior", label: "Icon Right", description: "Icon after text", defaultIconPosition: "right" },
  { id: "fab", group: "behavior", label: "FAB", description: "Floating action on mobile", defaultIconPosition: "only" },
  { id: "loading", group: "behavior", label: "Loading", description: "Busy state with spinner" },
  { id: "disabled", group: "behavior", label: "Disabled", description: "Unavailable action" },

  { id: "order", group: "restaurant", label: "Order", description: "Primary restaurant ordering CTA", ctaWeight: "primary" },
  { id: "call", group: "restaurant", label: "Call", description: "Call the branch", recommendedFor: ["tel: links"] },
  { id: "map", group: "restaurant", label: "Map", description: "Open map/location", recommendedFor: ["map links"] },
  { id: "add-to-cart", group: "restaurant", label: "Add to Cart", description: "Inline menu add", ctaWeight: "supporting" },
]

export const BUTTON_VARIANT_SCHEMA = {
  type: "object",
  properties: {
    variant: {
      type: "string",
      enum: BUTTON_VARIANTS.map((v) => v.id),
      description: "Visual/semantic button variant",
    },
    state: {
      type: "string",
      enum: ["default", "loading", "disabled"],
      default: "default",
    },
    href: { type: "string" },
    text: { type: "string" },
    iconLeft: { type: "string" },
    iconRight: { type: "string" },
    floating: { type: "boolean", description: "Allow floating FAB style" },
  },
  required: ["variant", "href", "text"],
} as const

export type ButtonVariantSchema = typeof BUTTON_VARIANT_SCHEMA
