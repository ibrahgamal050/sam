import AboutPage from "@/components/ar/about-page"
import type { IPage as AboutPageType } from "@/types/page"
import Pages from "@/models/page"
import dbConnect from "@/lib/db"
import mongoose from "mongoose"
import { headers } from "next/headers"
import Restaurant from "@/models/restaurant"
import type { Metadata } from 'next';
import type { IRestaurant } from "@/types/restaurant";

export const revalidate = 3600 // كل ساعة


export default async function About() {
  await dbConnect();

  const headersList = await headers(); // ✅ await هنا مهم
  const host = headersList.get('host'); // ✅ هذا الآن يعمل

  const subdomain = host?.split('.')[0];
  if (!subdomain) {
    return <div className="text-center py-10 text-red-600">لم يتم العثور على اسم النطاق الفرعي</div>;
  }
 
  try {
    // جلب بيانات صفحة "عن"
    const pageData = await getPageBySlug(subdomain, "about", "ar")

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


export async function getPageBySlug(subdomain: string, slug: string, language: "en" | "ar") {
  await dbConnect()

  const result = await Pages.findOne(
    {
      subdomain: subdomain,
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



export async function generateMetadata(): Promise<Metadata> {
  await dbConnect()
  const headersList = await headers(); // ✅ await هنا مهم
  const host = headersList.get('host'); // ✅ هذا الآن يعمل

  const subdomain = host?.split('.')[0];

  const restaurant = await Restaurant.findOne({ subdomain }).lean<IRestaurant>();
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
  const allowedTypes = [
    "website",
    "article",
    "book",
    "profile",
    "music.song",
    "music.album",
    "music.playlist",
    "music.radio_station",
    "video.movie",
    "video.episode",
    "video.tv_show",
    "video.other",
  ] as const;
  
  type OpenGraphType = typeof allowedTypes[number];
  
  const ogType: OpenGraphType =
    allowedTypes.includes(pageData?.seo?.og_type as OpenGraphType)
      ? (pageData?.seo?.og_type as OpenGraphType)
      : "website";
  return {
    title: pageData?.seo?.title || `عن ${restaurant.name.ar}`,
    description: pageData?.seo?.description || `اعرف المزيد عن مطعم ${restaurant.name}`,
    keywords: pageData?.seo?.keywords || ["مطعم", restaurant.name.ar, "عن المطعم"],
    openGraph: {
      title: pageData?.seo?.og_title || `عن ${restaurant.name.ar}`,
      description: pageData?.seo?.og_description || `تفاصيل مطعم ${restaurant.name.ar}`,
      images: [pageData?.seo?.og_image || restaurant.logo],
      type: ogType,
    },
    twitter: {
      card: pageData?.seo?.twitter_card || "summary_large_image",
      title: pageData?.seo?.twitter_title || restaurant.name.ar,
      description: pageData?.seo?.twitter_description || `عن مطعم ${restaurant.name}`,
      images: [pageData?.seo?.twitter_image || restaurant.logo],
    },
    alternates: {
      canonical: pageData?.seo?.canonical_url || `https://${host}/ar/about`,
    },
  }
}
