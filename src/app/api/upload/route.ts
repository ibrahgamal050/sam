import { type NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"
import { Types } from "mongoose"
import  Menu  from "@/models/menu" // تأكد من المسار
import dbConnect from "@/lib/db" // الاتصال بقاعدة البيانات
function generateFileName(fileExtension: string) {
  const randomNumber = Math.floor(1000 + Math.random() * 9000); // رقم عشوائي من 1000 إلى 9999
  return `photo-menu-${randomNumber}.${fileExtension}`;
}
export async function POST(request: NextRequest) {
  try {
    await dbConnect() // تأكد من الاتصال بـ MongoDB

    const formData = await request.formData()
    const file = formData.get("file") as File
    const altText = formData.get("altText") as string
    const subdomain = (formData.get("subdomain") as string) || "default"

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const dirPath = join(process.cwd(), "public", "images", subdomain, "menu")

    if (!existsSync(dirPath)) {
      await mkdir(dirPath, { recursive: true })
    }

    const number = Math.floor(Math.random() * 10000); // من 0 إلى 9999
  const paddedNumber = number.toString().padStart(4, "0");
    const fileExtension = file.name.split(".").pop()
    const fileName = `photo-menu-${paddedNumber}.${fileExtension}`
    const filePath = join(dirPath, fileName)

    await writeFile(filePath, buffer)

    const imageUrl = `/images/${subdomain}/menu/${fileName}`

    // 🔄 تحديث وثيقة Menu المرتبطة بـ subdomain
    const updatedMenu = await Menu.findOneAndUpdate(
      { name: subdomain }, // أو استخدم restaurantId لو عندك
      {
        $push: {
          menuImages: {
            url: imageUrl,
            altText,
          },
        },
      },
      { new: true } // عشان يرجعلك الوثيقة بعد التحديث
    )

    if (!updatedMenu) {
      return NextResponse.json({ error: "Menu not found for this subdomain" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      image: {
        url: imageUrl,
        altText,
        subdomain,
        originalName: file.name,
        createdAt: new Date(),
      },
    })
  } catch (error) {
    console.error("Error uploading file:", error)
    return NextResponse.json({ error: "Error uploading file" }, { status: 500 })
  }
}
