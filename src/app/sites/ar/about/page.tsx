import AboutPage from "@/components/ar/about-page"
import type { AboutPage as AboutPageType } from "@/types/page"
import Pages from "@/models/page"
import dbConnect from "@/lib/db"
import mongoose from "mongoose"

export const revalidate = 3600 // كل ساعة

export default async function About() {
  const restaurantId =  "672fd2817c36cde35b81605a"

  try {
    // جلب بيانات صفحة "عن"
    const pageData = await getPageBySlug(restaurantId, "about", "ar")
    console.log(pageData)

    // لو مفيش بيانات
    if (!pageData) {
      return <div className="text-center py-10 text-red-600">لم يتم العثور على صفحة عن المطعم</div>
    }

    // تأكيد نوع البيانات (type assertion)
    const aboutPageData = pageData as AboutPageType

    // عرض صفحة "عن"
    return <AboutPage data={aboutPageData} />
  } catch (error) {
    console.error("Error fetching about page:", error)
    return <div className="text-center py-10 text-red-600">حدث خطأ أثناء تحميل الصفحة</div>
  }
}

/**
 * Get a page by slug and language
 */
export async function getPageBySlug(restaurantId: string, slug: string, language: "en" | "ar") {
  await dbConnect()

  const result = await Pages.findOne(
    {
      restaurantId: new mongoose.Types.ObjectId(restaurantId),
      pages: {
        $elemMatch: {
          slug,
          language,
        },
      },
    },
    {
      "pages.$": 1, // Project only the matched element from the pages array
    },
  ).lean()

  return result?.pages?.[0] || null
}

/**
 * Get all pages for a restaurant
 */
export async function getAllPages(restaurantId: string) {
  await dbConnect()

  const result = await Pages.findOne({ restaurantId: new mongoose.Types.ObjectId(restaurantId) }).lean()

  return result?.pages || []
}
