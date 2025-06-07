import dbConnect from "@/lib/db"
import Restaurant from "@/models/restaurant"
import { RestaurantHome } from "@/components/ar/RestaurantHome"
import { IRestaurant  } from "@/types/restaurant" // Make sure to import the Restaurant type if you have it.


import { headers } from 'next/headers';

export default async function HomeContent() {
  await dbConnect();

  const headersList = await headers(); // ✅ await هنا مهم
  const host = headersList.get('host'); // ✅ هذا الآن يعمل

  const subdomain = host?.split('.')[0];

  const restaurant = await Restaurant.findOne({ subdomain }).lean() as IRestaurant | null;

  if (!restaurant) {
    return <div className="p-4">المطعم غير موجود</div>;
  }

  return <RestaurantHome restaurant={restaurant} />;
}