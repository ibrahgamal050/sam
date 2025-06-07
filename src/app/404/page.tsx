import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
      <h1 className="text-4xl font-bold mb-4">Restaurant Not Found</h1>
      <p className="text-xl text-muted-foreground mb-8">
        The restaurant you're looking for doesn't exist or hasn't been set up yet.
      </p>
      <Link href="/">
        <Button size="lg">Go to Homepage</Button>
      </Link>
    </div>
  )
}
