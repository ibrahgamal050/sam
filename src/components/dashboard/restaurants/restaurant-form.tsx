"use client"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import type { Restaurant } from "@/lib/types"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useState } from "react"

const formSchema = z.object({
  nameEn: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  nameAr: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  subdomain: z
    .string()
    .min(3, {
      message: "Subdomain must be at least 3 characters.",
    })
    .regex(/^[a-z0-9-]+$/, {
      message: "Subdomain can only contain lowercase letters, numbers, and hyphens.",
    }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  phone: z.string().min(5, {
    message: "Phone number is required.",
  }),
  isPublished: z.boolean().default(false),
  logo: z.string().optional(),
  coverImage: z.string().optional(),
})

interface RestaurantFormProps {
  restaurant?: Restaurant
}

export function RestaurantForm({ restaurant }: RestaurantFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nameEn: restaurant?.name.en || "",
      nameAr: restaurant?.name.ar || "",
      subdomain: restaurant?.subdomain || "",
      description: restaurant?.description || "",
      phone: restaurant?.phones?.[0] || "",
      isPublished: restaurant?.isPublished || false,
      logo: restaurant?.logo || "",
      coverImage: restaurant?.coverImage || "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)

    try {
      // In a real app, you would call an API to create/update the restaurant
      console.log("Form values:", values)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Redirect to restaurants list
      router.push("/dashboard/restaurants")
    } catch (error) {
      console.error("Error submitting form:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="grid gap-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Enter the basic details for the restaurant</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="nameEn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name (English)</FormLabel>
                      <FormControl>
                        <Input placeholder="Restaurant name in English" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="nameAr"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name (Arabic)</FormLabel>
                      <FormControl>
                        <Input placeholder="Restaurant name in Arabic" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="subdomain"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subdomain</FormLabel>
                    <FormControl>
                      <Input placeholder="restaurant-name" {...field} />
                    </FormControl>
                    <FormDescription>
                      This will be used for the restaurant URL: https://[subdomain].example.com
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter a description for the restaurant"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Primary Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Phone number" {...field} />
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
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Published Status</FormLabel>
                      <FormDescription>Make the restaurant visible to customers</FormDescription>
                    </div>
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
              <CardTitle>Media</CardTitle>
              <CardDescription>Upload logo and cover image for the restaurant</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="logo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Logo</FormLabel>
                      <FormControl>
                        <div className="flex flex-col items-center justify-center rounded-md border border-dashed p-4">
                          <div className="flex h-40 w-40 items-center justify-center rounded-md bg-muted">
                            {field.value ? (
                              <img
                                src={field.value || "/placeholder.svg"}
                                alt="Restaurant logo"
                                className="h-full w-full rounded-md object-cover"
                              />
                            ) : (
                              <span className="text-sm text-muted-foreground">No logo uploaded</span>
                            )}
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="mt-4"
                            onClick={() => {
                              // In a real app, this would open a file picker
                              console.log("Upload logo clicked")
                            }}
                          >
                            Upload Logo
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="coverImage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cover Image</FormLabel>
                      <FormControl>
                        <div className="flex flex-col items-center justify-center rounded-md border border-dashed p-4">
                          <div className="flex h-40 w-full items-center justify-center rounded-md bg-muted">
                            {field.value ? (
                              <img
                                src={field.value || "/placeholder.svg"}
                                alt="Restaurant cover"
                                className="h-full w-full rounded-md object-cover"
                              />
                            ) : (
                              <span className="text-sm text-muted-foreground">No cover image uploaded</span>
                            )}
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="mt-4"
                            onClick={() => {
                              // In a real app, this would open a file picker
                              console.log("Upload cover image clicked")
                            }}
                          >
                            Upload Cover Image
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => router.push("/dashboard/restaurants")}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : restaurant ? "Update Restaurant" : "Create Restaurant"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
