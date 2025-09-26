import mongoose from "mongoose"
import type { Metadata } from "next"
import { notFound } from "next/navigation"

import dbConnect from "@/lib/db"
import { resolveRestaurantFromHeaders } from "@/lib/domain/restaurant-context"
import { getRootDomain, resolveRestaurantHost } from "@/lib/host-utils"
import Post from "@/models/post"
import type { IRestaurant } from "@/types/restaurant"
import { SinglePostPage } from "@/components/single-post-page"

const stripHtml = (value: string) => value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()

const resolveProtocol = (hostHeader: string): "http" | "https" => {
  const normalized = hostHeader.toLowerCase()
  return normalized.includes("localhost") || normalized.includes("127.0.0.1") ? "http" : "https"
}

const ensureAbsoluteUrl = (path: string | undefined | null, host: string, protocol: "http" | "https") => {
  if (!path) return undefined
  if (path.startsWith("http")) return path
  const normalized = path.startsWith("/") ? path : `/${path}`
  return `${protocol}://${host}${normalized}`
}

export async function generateMetadata({ params }: { params: { postId: string } }): Promise<Metadata> {
  try {
    const { restaurant, hostHeader } = await resolveRestaurantFromHeaders()
    const typedRestaurant = restaurant as IRestaurant | null

    if (!typedRestaurant) {
      return {
        title: "المقال غير متاح",
        description: "لا يمكن العثور على بيانات المطعم لعرض تفاصيل المقال.",
      }
    }

    if (!mongoose.Types.ObjectId.isValid(params.postId)) {
      return {
        title: "المقال غير موجود",
        description: `لم يتم العثور على المقال المطلوب في ${typedRestaurant.name?.ar ?? typedRestaurant.name?.en ?? typedRestaurant.subdomain}.`,
      }
    }

    await dbConnect()

    const post = await Post.findOne({
      _id: new mongoose.Types.ObjectId(params.postId),
      restaurantId: typedRestaurant._id,
    }).lean()

    if (!post) {
      return {
        title: "المقال غير موجود",
        description: `لم يتم العثور على المقال المطلوب في ${typedRestaurant.name?.ar ?? typedRestaurant.name?.en ?? typedRestaurant.subdomain}.`,
      }
    }

    const resolvedHost = resolveRestaurantHost(typedRestaurant, hostHeader, getRootDomain())
    const protocol = resolveProtocol(hostHeader)
    const canonicalUrl = `${protocol}://${resolvedHost}/ar/posts/${params.postId}`
    const restaurantName = typedRestaurant.name?.ar || typedRestaurant.name?.en || typedRestaurant.subdomain
    const plainContent = stripHtml(post.content ?? "")
    const description = plainContent.slice(0, 160) || `اقرأ مقال ${post.title} من ${restaurantName}.`
    const publishedTime = post.createdAt instanceof Date ? post.createdAt.toISOString() : new Date(post.createdAt).toISOString()
    const updatedTime = post.updatedAt instanceof Date ? post.updatedAt.toISOString() : new Date(post.updatedAt).toISOString()
    const imageUrl = ensureAbsoluteUrl(post.image ?? typedRestaurant.coverImage, resolvedHost, protocol)

    const structuredData = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.title,
      description,
      datePublished: publishedTime,
      dateModified: updatedTime,
      image: imageUrl,
      author: {
        "@type": "Organization",
        name: restaurantName,
      },
      publisher: {
        "@type": "Organization",
        name: restaurantName,
        logo: ensureAbsoluteUrl(typedRestaurant.logo, resolvedHost, protocol),
      },
      mainEntityOfPage: canonicalUrl,
    }

    return {
      title: `${post.title} | ${restaurantName}`,
      description,
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        title: post.title,
        description,
        type: "article",
        url: canonicalUrl,
        publishedTime,
        modifiedTime: updatedTime,
        images: imageUrl ? [{ url: imageUrl }] : undefined,
      },
      twitter: {
        card: "summary_large_image",
        title: post.title,
        description,
        images: imageUrl ? [imageUrl] : undefined,
      },
      other: {
        "ld+json": JSON.stringify(structuredData),
      },
    }
  } catch (error) {
    console.error("Error generating post metadata", error)
    return {
      title: "مقال المطعم",
      description: "اقرأ أحدث المقالات والأخبار من المطعم.",
    }
  }
}

export default async function PostDetailsPage({ params }: { params: { postId: string } }) {
  const { restaurant } = await resolveRestaurantFromHeaders()
  const typedRestaurant = restaurant as IRestaurant | null

  if (!typedRestaurant || !mongoose.Types.ObjectId.isValid(params.postId)) {
    return notFound()
  }

  await dbConnect()
  const exists = await Post.exists({
    _id: new mongoose.Types.ObjectId(params.postId),
    restaurantId: typedRestaurant._id,
  })

  if (!exists) {
    return notFound()
  }

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      <SinglePostPage id={params.postId} />
    </div>
  )
}
