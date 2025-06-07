"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { useState } from "react"

export function SearchForm() {
  const [query, setQuery] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, you would implement search functionality
    console.log("Searching for:", query)
  }

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-md mx-auto mt-4 mb-2">
      <Input
        type="search"
        placeholder="Search menu..."
        className="pr-10"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <Button type="submit" size="icon" variant="ghost" className="absolute right-0 top-0 h-full">
        <Search className="h-4 w-4" />
      </Button>
    </form>
  )
}
