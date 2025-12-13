import mongoose from "mongoose"
import connectToDatabase from "@/lib/db"
import Pages from "@/models/page"
import type { IPage, ISEO, IComponent } from "@/types/page"
export const ALLOWED_COMPONENT_TYPES = ["text", "image", "gallery"]
function toPlain<T>(doc: T): any {
  return JSON.parse(JSON.stringify(doc))
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



  