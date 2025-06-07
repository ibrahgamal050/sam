"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { MapPin, Phone, Mail, Instagram, Facebook, Twitter, Globe } from "lucide-react"
import { useState } from "react"
import { useRestaurant } from "@/contexts/restaurant-context"
import { useParams } from "next/navigation"
import { Skeleton } from "@/components/ui/skeleton"

export function ContactPage() {
  const { restaurant, isLoading } = useRestaurant()
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const params = useParams()
  const slug = params?.slug as string

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormState((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!restaurant) return

    try {
      setIsSubmitting(true)
      setSubmitMessage(null)

      // In a real app, you would send this data to your backend
      const response = await fetch(`/api/restaurants/${slug}/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formState,
          restaurantId: restaurant._id,
        }),
      })

      if (response.ok) {
        setSubmitMessage({
          type: "success",
          text: "Thank you for your message! We'll get back to you soon.",
        })
        setFormState({ name: "", email: "", message: "" })
      } else {
        setSubmitMessage({
          type: "error",
          text: "Failed to send message. Please try again later.",
        })
      }
    } catch (error) {
      console.error("Error submitting form:", error)
      setSubmitMessage({
        type: "error",
        text: "An error occurred. Please try again later.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return <ContactPageSkeleton />
  }

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold">Contact Us</h1>

      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-primary mt-0.5" />
            <p className="text-sm">{restaurant?.location?.address || "Address not available"}</p>
          </div>
          <div className="flex items-start gap-3">
            <Phone className="h-5 w-5 text-primary mt-0.5" />
            <p className="text-sm">{restaurant?.phone || "Phone not available"}</p>
          </div>
          <div className="flex items-start gap-3">
            <Mail className="h-5 w-5 text-primary mt-0.5" />
            <p className="text-sm">{restaurant?.email || "Email not available"}</p>
          </div>
          {restaurant?.website && (
            <div className="flex items-start gap-3">
              <Globe className="h-5 w-5 text-primary mt-0.5" />
              <a
                href={restaurant.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline"
              >
                {restaurant.website.replace(/^https?:\/\//, "")}
              </a>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Map section */}
      <div className="relative w-full h-48 rounded-lg overflow-hidden">
        {restaurant?.location?.latitude && restaurant?.location?.longitude ? (
          <iframe
            title="Restaurant Location"
            width="100%"
            height="100%"
            frameBorder="0"
            src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${restaurant.location.latitude},${restaurant.location.longitude}`}
            allowFullScreen
          ></iframe>
        ) : (
          <div className="absolute inset-0 bg-muted flex items-center justify-center">
            <MapPin className="h-8 w-8 text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Map Location</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <h2 className="text-xl font-semibold">Send Us a Message</h2>

        {submitMessage && (
          <div
            className={`p-3 rounded-md ${
              submitMessage.type === "success"
                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
            }`}
          >
            {submitMessage.text}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            name="name"
            value={formState.name}
            onChange={handleChange}
            required
            disabled={isSubmitting}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formState.email}
            onChange={handleChange}
            required
            disabled={isSubmitting}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="message">Message</Label>
          <Textarea
            id="message"
            name="message"
            value={formState.message}
            onChange={handleChange}
            rows={4}
            required
            disabled={isSubmitting}
          />
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Sending..." : "Send Message"}
        </Button>
      </form>

      <div className="pt-4">
        <h2 className="text-xl font-semibold mb-3">Follow Us</h2>
        <div className="flex gap-4">
          {restaurant?.social?.facebook && (
            <a
              href={restaurant.social.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 bg-muted rounded-full hover:bg-primary/10 transition-colors"
            >
              <Facebook className="h-6 w-6" />
            </a>
          )}
          {restaurant?.social?.instagram && (
            <a
              href={restaurant.social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 bg-muted rounded-full hover:bg-primary/10 transition-colors"
            >
              <Instagram className="h-6 w-6" />
            </a>
          )}
          {restaurant?.social?.twitter && (
            <a
              href={restaurant.social.twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 bg-muted rounded-full hover:bg-primary/10 transition-colors"
            >
              <Twitter className="h-6 w-6" />
            </a>
          )}
          {restaurant?.social?.tiktok && (
            <a
              href={restaurant.social.tiktok}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 bg-muted rounded-full hover:bg-primary/10 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6"
              >
                <path d="M9 12a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" />
                <path d="M15 8a4 4 0 0 0 0 8" />
                <path d="M15 8a4 4 0 0 1 4 4V4" />
                <line x1="15" y1="12" x2="15" y2="20" />
              </svg>
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

function ContactPageSkeleton() {
  return (
    <div className="p-4 space-y-6">
      <Skeleton className="h-8 w-40" />

      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-5 w-5 rounded-full" />
            <Skeleton className="h-4 w-48" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-5 w-5 rounded-full" />
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-5 w-5 rounded-full" />
            <Skeleton className="h-4 w-40" />
          </div>
        </CardContent>
      </Card>

      <Skeleton className="h-48 w-full rounded-lg" />

      <div className="space-y-4">
        <Skeleton className="h-6 w-48" />

        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>

        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>

        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-32 w-full rounded-md" />
        </div>

        <Skeleton className="h-10 w-full rounded-md" />
      </div>
    </div>
  )
}
