import mongoose from "mongoose"
import connectToDatabase from "@/lib/db"
import Pages from "@/models/page"
import type { IPage, ISEO, IComponent } from "@/types/page"
export const ALLOWED_COMPONENT_TYPES = ["text", "image", "gallery"]
function toPlain<T>(doc: T): any {
  return JSON.parse(JSON.stringify(doc))
}

export async function getPagesByRestaurantId(restaurantId: string) {
  await connectToDatabase()

  if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
    return []
  }

  const pagesDoc = await Pages.findOne({ restaurantId })
  return pagesDoc ? toPlain(pagesDoc.pages) : []
}

export async function getPageById(restaurantId: string, pageId: string) {
  await connectToDatabase ()

  if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
    return null
  }

  const pagesDoc = await Pages.findOne({ restaurantId })
  if (!pagesDoc) return null
  const page = pagesDoc.pages.find((p) => p._id.toString() === pageId)
  return page ? toPlain(page) : null
}

export interface PageInput {
  name: string
  slug: string
  language: "en" | "ar"
  template?: boolean
  isPublished?: boolean
  headerImage?: string
  seo: ISEO
  components: IComponent[]
}

export async function createPage(restaurantId: string, subdomain: string, data: PageInput) {
  await connectToDatabase ()

  if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
    throw new Error("Invalid restaurant ID")
  }

  let pagesDoc = await Pages.findOne({ restaurantId })

  // auto generate canonical_url if missing
  if (!data.seo.canonical_url) {
    data.seo.canonical_url = `https://${subdomain}.meelza.com/${data.slug}`
  }
  if (data.seo.structured_data) {
    data.seo.structured_data.url = data.seo.canonical_url
  }
  // provide defaults for required image fields
  data.seo.og_image = data.seo.og_image || "/placeholder.svg?height=400&width=800"
  data.seo.twitter_image = data.seo.twitter_image || "/placeholder.svg?height=400&width=800"
  if (data.seo.structured_data) {
    data.seo.structured_data.image =
      data.seo.structured_data.image || "/placeholder.svg?height=400&width=800"
  }

  const newPage: IPage = {
    _id: new mongoose.Types.ObjectId(),
    name: data.name,
    slug: data.slug,
    language: data.language,
    template: data.template ?? false,
    isPublished: data.isPublished ?? false,
    headerImage: data.headerImage || "/placeholder.svg?height=400&width=800",
    seo: data.seo,
    components: data.components,
    metadata: {
      created_at: new Date(),
      updated_at: new Date(),
    },
  }

  if (!pagesDoc) {
    pagesDoc = new Pages({ restaurantId, subdomain, pages: [newPage] })
  } else {
    const exists = pagesDoc.pages.some(
      (p) => p.slug === newPage.slug && p.language === newPage.language,
    )
    if (exists) {
      throw new Error("Slug already exists for this restaurant")
    }
    pagesDoc.pages.push(newPage)
  }

  await pagesDoc.save()
  return toPlain(newPage)
}

export async function updatePage(
  restaurantId: string,
  pageId: string,
  data: Partial<PageInput>,
) {
  await connectToDatabase()

  if (!mongoose.Types.ObjectId.isValid(restaurantId)) return null

  const pagesDoc = await Pages.findOne({ restaurantId })
  if (!pagesDoc) return null
  const page = pagesDoc.pages.find((p) => p._id.toString() === pageId)
  if (!page) return null

  if (data.slug && data.slug !== page.slug) {
    const exists = pagesDoc.pages.some(
      (p) => p._id.toString() !== pageId && p.slug === data.slug && p.language === (data.language || page.language),
    )
    if (exists) {
      throw new Error("Slug already exists for this restaurant")
    }
  }

  if (data.name !== undefined) page.name = data.name
  if (data.slug !== undefined) page.slug = data.slug
  if (data.language !== undefined) page.language = data.language
  if (data.template !== undefined) page.template = data.template
  if (data.isPublished !== undefined) page.isPublished = data.isPublished
  if (data.headerImage !== undefined) page.headerImage = data.headerImage
  if (data.seo) {
    if (!data.seo.canonical_url) {
      data.seo.canonical_url = `https://${pagesDoc.subdomain}.meelza.com/${data.slug || page.slug}`
    }
    if (data.seo.structured_data) {
      data.seo.structured_data.url = data.seo.canonical_url
      data.seo.structured_data.image =
        data.seo.structured_data.image || page.seo.structured_data.image
    }
    const mergedSeo = { ...page.seo, ...data.seo }
    mergedSeo.og_image = mergedSeo.og_image || "/placeholder.svg?height=400&width=800"
    mergedSeo.twitter_image =
      mergedSeo.twitter_image || "/placeholder.svg?height=400&width=800"
    page.seo = mergedSeo
  }
  if (data.components) page.components = data.components

  page.metadata.updated_at = new Date()
  if (page.isPublished && !page.metadata.published_at) {
    page.metadata.published_at = new Date()
  }

  await pagesDoc.save()
  return toPlain(page)
}

export async function deletePage(restaurantId: string, pageId: string) {
  await connectToDatabase ()

  if (!mongoose.Types.ObjectId.isValid(restaurantId)) return false

  const result = await Pages.updateOne(
    { restaurantId },
    { $pull: { pages: { _id: pageId } } },
  )

  return result.modifiedCount > 0
}
export async function getPageBySlug(
  restaurantId: string,
  slug: string,
  language: "en" | "ar",
) {
  await connectToDatabase()

  if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
    return null
  }

  const result = await Pages.findOne(
    {
      restaurantId,
      pages: {
        $elemMatch: { slug, language },
      },
    },
    {
      "pages.$": 1,
    },
  ).lean()

  return result?.pages?.[0] ? toPlain(result.pages[0]) : null
}

export async function updatePageBySlug(
  restaurantId: string,
  slug: string,
  language: "en" | "ar",
  components: IComponent[],
) {
  await connectToDatabase()

  if (!mongoose.Types.ObjectId.isValid(restaurantId)) return null

  const pagesDoc = await Pages.findOne({ restaurantId })
  if (!pagesDoc) return null

  const page = pagesDoc.pages.find(
    (p) => p.slug === slug && p.language === language,
  )
  if (!page) return null

  page.components = components
  page.metadata.updated_at = new Date()

  await pagesDoc.save()
  return toPlain(page)
}
export async function updatePageComponents(
    restaurantId: string,
    pageId: string,
    operation: "add" | "update" | "delete",
    data: Partial<IComponent>
  ) {
    await connectToDatabase ()
  
    if (!mongoose.Types.ObjectId.isValid(restaurantId)) return null
  
    const pagesDoc = await Pages.findOne({ restaurantId })
    if (!pagesDoc) return null
    const page = pagesDoc.pages.find((p) => p._id.toString() === pageId)
   
    if (!page) return null
  
    switch (operation) {
      case "add": {
        const { type, props, position } = data
        if (!type || props === undefined || position === undefined) {
          throw new Error("Missing required fields for component addition")
        }
        if (!ALLOWED_COMPONENT_TYPES.includes(type)) {
          throw new Error(`Invalid component type: ${type}`)
        }
  
        const newComponent: IComponent = {
          component_id: data.component_id || new mongoose.Types.ObjectId().toString(),
          type,
          props,
          position,
        }
  
        page.components.push(newComponent)
        break
      }
  
      case "update": {
        const { component_id } = data
        if (!component_id) throw new Error("component_id is required for update")
  
        const comp = page.components.find(c => c.component_id === component_id)
        if (!comp) return null
  
        if (data.type) {
          if (!ALLOWED_COMPONENT_TYPES.includes(data.type)) {
            throw new Error(`Invalid component type: ${data.type}`)
          }
          comp.type = data.type
        }
  
        if (data.props) {
          comp.props = { ...comp.props, ...data.props }
        }
  
        if (data.position !== undefined) {
          comp.position = data.position
        }
  
        break
      }
  
      case "delete": {
        const { component_id } = data
        if (!component_id) throw new Error("component_id is required for deletion")
  
        const index = page.components.findIndex(c => c.component_id === component_id)
        if (index === -1) return null
  
        page.components.splice(index, 1)
        break
      }
  
      default:
        throw new Error(`Unsupported operation: ${operation}`)
    }
  
    page.metadata.updated_at = new Date()
    await pagesDoc.save()
  
    return toPlain(page.components)
  }
  