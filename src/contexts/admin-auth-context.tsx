"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useParams, useRouter } from "next/navigation"

interface Admin {
  _id: string
  email: string
  role: "owner" | "manager" | "staff"
}

interface AdminAuthContextType {
  admin: Admin | null
  isLoading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AdminAuthContext = createContext<AdminAuthContextType>({
  admin: null,
  isLoading: true,
  error: null,
  login: async () => {},
  logout: () => {},
})

export const useAdminAuth = () => useContext(AdminAuthContext)

export const AdminAuthProvider = ({ children }: { children: ReactNode }) => {
  const [admin, setAdmin] = useState<Admin | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const params = useParams()
  const router = useRouter()
  const slug = params?.slug as string

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Check if there's a token in localStorage
        const token = localStorage.getItem("adminToken")

        if (!token) {
          setAdmin(null)
          setIsLoading(false)
          return
        }

        // Verify token with the server
        const response = await fetch(`/api/admin/verify`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          setAdmin(data.admin)
        } else {
          // Token is invalid or expired
          localStorage.removeItem("adminToken")
          setAdmin(null)
        }
      } catch (err) {
        console.error("Auth error:", err)
        setError("Authentication failed")
        setAdmin(null)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`/api/admin/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, slug }),
      })

      if (response.ok) {
        const data = await response.json()
        localStorage.setItem("adminToken", data.token)
        setAdmin(data.admin)
      } else {
        const data = await response.json()
        setError(data.error || "Login failed")
      }
    } catch (err) {
      console.error("Login error:", err)
      setError("Login failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem("adminToken")
    setAdmin(null)
    router.push(`/admin/${slug}`)
  }

  return (
    <AdminAuthContext.Provider value={{ admin, isLoading, error, login, logout }}>{children}</AdminAuthContext.Provider>
  )
}
