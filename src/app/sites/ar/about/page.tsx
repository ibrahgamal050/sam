import AboutPage from "@/components/ar/about-page"
import type { IPage as AboutPageType } from "@/types/page"
import Pages from "@/models/page"
import dbConnect from "@/lib/db"
import mongoose from "mongoose"
import { headers } from "next/headers"
import Restaurant from "@/models/restaurant"
import { IRestaurant  } from "@/types/restaurant" // Make sure to import the Restaurant type if you have it.

export const revalidate = 3600 // كل ساعة

export default async function About() {
  await dbConnect();

  const headersList = await headers(); // ✅ await هنا مهم
  const host = headersList.get('host'); // ✅ هذا الآن يعمل

  const subdomain = host?.split('.')[0];

  const restaurant = await Restaurant.findOne({ subdomain }).lean() as IRestaurant | null;
  try {
    // جلب بيانات صفحة "عن"
    const pageData = await getPageBySlug(  restaurant._id, "about", "ar")
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
export async function generateMetadata(): Promise<Metadata> {
  await dbConnect()
  const host = headers().get("host") || ""
  const subdomain = host.split(".")[0]

  const restaurant = await Restaurant.findOne({ subdomain }).lean()
  if (!restaurant) return {}

  const page = await Pages.findOne(
    {
      restaurantId: new mongoose.Types.ObjectId(restaurant._id),
      pages: { $elemMatch: { slug: "about", language: "ar" } },
    },
    {
      "pages.$": 1,
    },
  ).lean()

  const pageData = page?.pages?.[0]

  return {
    title: pageData?.seo?.title || `عن ${restaurant.name}`,
    description: pageData?.seo?.description || `اعرف المزيد عن مطعم ${restaurant.name}`,
    keywords: pageData?.seo?.keywords || ["مطعم", restaurant.name, "عن المطعم"],
    openGraph: {
      title: pageData?.seo?.og_title || `عن ${restaurant.name}`,
      description: pageData?.seo?.og_description || `تفاصيل مطعم ${restaurant.name}`,
      images: [pageData?.seo?.og_image || restaurant.image],
      type: pageData?.seo?.og_type || "website",
    },
    twitter: {
      card: pageData?.seo?.twitter_card || "summary_large_image",
      title: pageData?.seo?.twitter_title || restaurant.name,
      description: pageData?.seo?.twitter_description || `عن مطعم ${restaurant.name}`,
      images: [pageData?.seo?.twitter_image || restaurant.image],
    },
    alternates: {
      canonical: pageData?.seo?.canonical_url || `https://${host}/ar/about`,
    },
  }
}
