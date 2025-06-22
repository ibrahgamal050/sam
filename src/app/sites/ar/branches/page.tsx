import { BranchesPage } from "@/components/ar/branches-page"
import dbConnect from "@/lib/db"
import Restaurant from "@/models/restaurant"
import { headers } from 'next/headers';
import { IRestaurant } from "@/types";

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
