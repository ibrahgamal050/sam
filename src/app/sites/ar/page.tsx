export const runtime = 'nodejs'; // أو 'edge' حسب ما تفضل
import type { Metadata } from "next"
import dbConnect from "@/lib/db"
import Restaurant from "@/models/restaurant"
import { RestaurantHome } from "@/components/ar/RestaurantHome"
import { IRestaurant } from "@/types/restaurant"
import { headers } from 'next/headers';

export default async function HomeContent() {
  await dbConnect();

  const headersList = await headers(); // ✅ استخدم await
  const host = headersList.get('host'); // ✅ دلوقتي get هتشتغل
  const subdomain = host?.split('.')[0];

  const restaurant = await Restaurant.findOne({ subdomain }).lean() as IRestaurant | null;

  if (!restaurant) {
    return <div className="p-4">المطعم غير موجود</div>;
  }

  return (
    <>
      
  
      <RestaurantHome restaurant={restaurant} />
    </>
  ) }

  export async function generateMetadata(): Promise<Metadata> {
    const headersList = headers()
    const host = (await headersList).get("host")
    const subdomain = host?.split(".")[0]
  
    await dbConnect()
    const restaurant = await Restaurant.findOne({ subdomain }).lean() as IRestaurant | null;
  
    if (!restaurant) {
      return {
        title: "المطعم غير موجود",
        description: "المطعم الذي تبحث عنه غير متاح حالياً.",
      }
    }
  
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "Restaurant",
      name: restaurant.name?.ar,
      image: `https://${host}/images${restaurant.coverImage}`,
      url: `https://${host}`,
      telephone: restaurant.phones,
     
    }
  
    return {
      title: restaurant.name?.ar || "مطعم على منصة ميلزا",
      description: restaurant.description || "تعرف على مطعمنا المميز.",
      openGraph: {
        title: restaurant.name?.ar,
        description: restaurant.description,
        images: [
          {
            url: `https://${host}/images${restaurant.coverImage}`,
            alt: restaurant.name?.ar || "صورة المطعم",
          },
        ],
      },
      other: {
        "ld+json": JSON.stringify(structuredData),
      },
    }
  }
  