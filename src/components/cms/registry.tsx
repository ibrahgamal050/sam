// components/cms/registry.ts
import type { AnyBlock } from "@/types/blocks"

type BlockRendererFn<T extends AnyBlock = AnyBlock> = (block: T) => Promise<JSX.Element> | JSX.Element

export const blocksRegistry: Record<AnyBlock["type"], BlockRendererFn> = {
  hero: async (b) => {
    const Comp = (await import("./blocks/Hero")).default
    return <Comp {...(b as any)} />
  },
  text: async (b) => {
    const Comp = (await import("./blocks/TextBlock")).default
    return <Comp {...(b as any)} />
  },
  image: async (b) => {
    const Comp = (await import("./blocks/ImageBlock")).default
    return <Comp {...(b as any)} />
  },
  story: async (b) => {
    const Comp = (await import("./blocks/Story")).default
    return <Comp {...(b as any)} />
  },
  menuGrid: async (b) => {
    const Comp = (await import("./blocks/MenuGrid")).default
    return <Comp {...(b as any)} />
  },
  testimonials: async (b) => {
    const Comp = (await import("./blocks/Testimonials")).default
    return <Comp {...(b as any)} />
  },
  branchesContact: async (b) => {
    const Comp = (await import("./blocks/BranchesContact")).default
    return <Comp {...(b as any)} />
  },
  branches: async (b) => {
    const Comp = (await import("./blocks/Branches")).default
    return <Comp {...(b as any)} />
  },
  categoriesStrip: async (b) => {
    const Comp = (await import("./blocks/CategoriesStrip")).default
    return <Comp {...(b as any)} />
  },
  menuTeaser: async (b) => {
    const Comp = (await import("./blocks/MenuTeaser")).default
    return <Comp {...(b as any)} />
  },
  features: async (b) => {
    const Comp = (await import("./blocks/Features")).default
    return <Comp {...(b as any)} />
  },
  deliveryInfo: async (b) => {
    const Comp = (await import("./blocks/DeliveryInfo")).default
    return <Comp {...(b as any)} />
  },
  cta: async (b) => {
    const Comp = (await import("./blocks/CtaBlock")).default
    return <Comp {...(b as any)} />
  },
  chefSection: async (b) => {
    const Comp = (await import("./blocks/ChefSection")).default
    return <Comp {...(b as any)} />
  },
  timeline: async (b) => {
    const Comp = (await import("./blocks/Timeline")).default
    return <Comp {...(b as any)} />
  },
  mapSection: async (b) => {
    const Comp = (await import("./blocks/MapSection")).default
    return <Comp {...(b as any)} />
  },
  socialProof: async (b) => {
    const Comp = (await import("./blocks/SocialProof")).default
    return <Comp {...(b as any)} />
  },
  footer: async (b) => {
    const Comp = (await import("./blocks/Footer")).default
    return <Comp {...(b as any)} />
  },
}
