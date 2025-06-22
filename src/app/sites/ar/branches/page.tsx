import { BranchesPage } from "@/components/ar/branches-page"
import dbConnect from "@/lib/db"
import Restaurant from "@/models/restaurant"
import { headers } from 'next/headers';
import { IRestaurant } from "@/types";

import type { Metadata } from "next"

export async function generateMetadata(): Promise<Metadata> {
  await dbConnect()

  const headersList = headers()
  const host = (await headersList).get("host")
  const subdomain = host?.split(".")[0]

  const restaurant = await Restaurant.findOne({ subdomain }).lean() as IRestaurant | null

  if (!restaurant) {
    return {
      title: "فروع المطعم",
      description: "تعرف على فروعنا ومواقعنا المختلفة",
    }
  }

  return {
    title: `فروع ${restaurant.name.ar}`,
    description: `تعرف على فروع ${restaurant.name.ar} ومواقعنا المختلفة لتجربة طعام رائعة.`,
    openGraph: {
      title: `فروع ${restaurant.name.ar}`,
      description: `تعرف على فروع ${restaurant.name.ar} ومواقعنا المختلفة لتجربة طعام رائعة.`,
      images: [
        {
          url: `/images${restaurant.coverImage || "/default-og.jpg"}`,
          alt: `${restaurant.name.ar} - صورة الغلاف`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `فروع ${restaurant.name.ar}`,
      description: `تعرف على فروع ${restaurant.name.ar} ومواقعنا المختلفة.`,
      images: [`/images${restaurant.coverImage || "/default-og.jpg"}`],
    },
  }
}
export default async function Branches({ params }: { params: { slug: string } }) {
  await dbConnect();

  const headersList = await headers(); // ✅ await هنا مهم
  const host = headersList.get('host'); // ✅ هذا الآن يعمل

  const subdomain = host?.split('.')[0];

  const restaurant = await Restaurant.findOne({ subdomain }).lean() as IRestaurant | null;

  if (!restaurant ) {
    // Handle case where restaurant is not found
    return <div>Restaurant not found</div>
  }

  // Get all branches
  

  return <BranchesPage restaurant={restaurant} />
}
