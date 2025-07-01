import { NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import Restaurant from "@/models/restaurant"
import Page from "@/models/page"
import generateAboutPage from "@/lib/generators/generate-about"
import { Types } from "mongoose"

export async function POST(req: NextRequest) {
  const id = new URL(req.url).searchParams.get("id")

  if (!id) {
    return NextResponse.json({ error: "معرف المطعم غير موجود" }, { status: 400 })
  }

  try {
    await dbConnect()
    const restaurant = await Restaurant.findById(id)

    if (!restaurant) {
      return NextResponse.json({ error: "المطعم غير موجود" }, { status: 404 })
    }

    // ✅ توليد صفحة "حولنا"
    const content = await generateAboutPage(restaurant)

    const aboutPage = {
      _id: new Types.ObjectId(),
      slug: "about",
      name: "عن المطعم",
      language: "ar",
      template: false,
      isPublished: true,
      seo: {
        title: content.content?.header?.title || `عن ${restaurant.name.ar}`,
        description: content.content?.header?.subtitle || "",
        keywords: ["مطعم", restaurant.name.ar],
        og_title: content.content?.header?.title || "",
        og_description: content.content?.header?.subtitle || "",
        og_image: `/${restaurant.subdomain}/logo.jpg`,
        og_type: "website",
        twitter_card: "summary",
        twitter_title: content.content?.header?.title || "",
        twitter_description: content.content?.header?.subtitle || "",
        twitter_image: `/${restaurant.subdomain}/logo.jpg`,
        canonical_url: `https://${restaurant.subdomain}.meelza.com/ar/about`,
        structured_data: {},
      },
      components: [
        {
          _id: new Types.ObjectId(),
          type: "header",
          position: 0,
          props: content.content?.header,
        },
        {
          _id: new Types.ObjectId(),
          type: "story",
          position: 1,
          props: content.content?.story,
        },
        {
          _id: new Types.ObjectId(),
          type: "mission",
          position: 2,
          props: content.content?.mission,
        },
        {
          _id: new Types.ObjectId(),
          type: "values",
          position: 3,
          props: content.content?.values,
        },
        {
          _id: new Types.ObjectId(),
          type: "team",
          position: 4,
          props: content.content?.team,
        },
      ],
      metadata: {
        created_at: new Date(),
        updated_at: new Date(),
      },
    }

    await Page.updateOne(
      { restaurantId: restaurant._id },
      { $push: { pages: aboutPage }, $set: { subdomain: restaurant.subdomain } },
      { upsert: true }
    )

    return NextResponse.json({ message: "✅ تم توليد صفحة عن المطعم وحفظها بنجاح." })
  } catch (err: any) {
    console.error("❌ Error:", err)
    return NextResponse.json({ error: "فشل التوليد" }, { status: 500 })
  }
}
