import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"

export function AboutPage() {
  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold">About Us</h1>

      <div className="relative w-full h-48 rounded-lg overflow-hidden">
        <Image src="/placeholder.svg?height=400&width=800" alt="Restaurant interior" fill className="object-cover" />
      </div>

      <section>
        <h2 className="text-xl font-semibold mb-2">Our Story</h2>
        <p className="text-muted-foreground">
          Founded in 2010, Gourmet Delight began as a small family restaurant with a passion for creating exceptional
          dining experiences. Over the years, we've grown into one of the most beloved culinary destinations in the
          city, while maintaining our commitment to quality ingredients and authentic flavors.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">Our Values</h2>
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium mb-1">Quality First</h3>
              <p className="text-sm text-muted-foreground">
                We source only the finest ingredients and prepare everything fresh daily.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium mb-1">Exceptional Service</h3>
              <p className="text-sm text-muted-foreground">
                Our staff is dedicated to providing a warm, welcoming experience for every guest.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium mb-1">Community Connection</h3>
              <p className="text-sm text-muted-foreground">
                We're proud to be part of our local community and support local producers and suppliers.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
