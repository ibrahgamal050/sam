"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageService, type Page, type PageInput } from "@/lib/page-service"

const formSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  language: z.enum(["en", "ar"]),
  headerImage: z.string().optional(),
  isPublished: z.boolean().default(false),
  seoTitle: z.string().min(2),
  seoDescription: z.string().min(2)
})

type FormValues = z.infer<typeof formSchema>

interface PageFormProps {
  restaurantId: string
  subdomain: string
  page?: Page
}

export function PageForm({ restaurantId, subdomain, page }: PageFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: page?.name || "",
      slug: page?.slug || "",
      language: page?.language || "ar",
      headerImage: page?.headerImage || "",
      isPublished: page?.isPublished || false,
      seoTitle: page?.seo.title || "",
      seoDescription: page?.seo.description || ""
    }
  })

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true)
    const payload: PageInput = {
      restaurantId,
      subdomain,
      name: values.name,
      slug: values.slug,
      language: values.language,
      headerImage: values.headerImage,
      isPublished: values.isPublished,
      seo: { title: values.seoTitle, description: values.seoDescription, keywords: [], og_title: values.seoTitle, og_description: values.seoDescription, og_image: "", og_type: "website", twitter_card: "summary", twitter_title: values.seoTitle, twitter_description: values.seoDescription, twitter_image: "", canonical_url: `https://${subdomain}.meelza.com/${values.slug}`, structured_data: { "@context": "https://schema.org", "@type": "Restaurant", name: subdomain, url: `https://${subdomain}.meelza.com/${values.slug}`, image: "", hasMenu: { "@type": "Menu", name: "Menu", description: "Menu", hasMenuSection: [] } } },
      components: []
    }

    try {
      if (page) {
        await PageService.updatePage(restaurantId, page._id, payload)
      } else {
        await PageService.createPage(payload)
      }
      router.push(`/dashboard/restaurants/${restaurantId}/pages`)
      router.refresh()
    } catch (e) {
      console.error(e)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Page name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug</FormLabel>
                  <FormControl>
                    <Input placeholder="slug" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="language"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Language</FormLabel>
                  <FormControl>
                    <select {...field} className="border p-2 rounded-md">
                      <option value="ar">Arabic</option>
                      <option value="en">English</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="headerImage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Header Image URL</FormLabel>
                  <FormControl>
                    <Input placeholder="/uploads/header.jpg" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isPublished"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <FormLabel className="text-base">Published</FormLabel>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>SEO</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="seoTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="SEO title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="seoDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea className="min-h-[100px]" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
        <div className="flex justify-end gap-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : page ? "Update Page" : "Create Page"}
          </Button>
        </div>
      </form>
    </Form>
  )
}