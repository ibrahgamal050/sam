import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import  dbConnect  from "@/lib/db"
import { User } from "@/models/User"

// This is the updated auth configuration with real user authentication
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          await dbConnect()

          // Find the user by email
          const user = await User.findOne({
            email: credentials.email,
            $or: [{ isActive: { $exists: false } }, { isActive: true }],
          })

          // If no user found or password doesn't match
          if (!user || !(await user.comparePassword(credentials.password))) {
            return null
          }

          // Return the user object
          const primaryRestaurant = user.restaurants?.[0]?.restaurantId?.toString?.()
          const primaryRole = user.roles?.[0] ?? "customer"

          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            restaurantId: primaryRestaurant,
            role: primaryRole,
          }
        } catch (error) {
          console.error("Auth error:", error)
          return null
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.restaurantId = (user as any).restaurantId ?? null
        token.role = (user as any).role ?? "customer"
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.restaurantId = (token.restaurantId as string | null) ?? undefined
        session.user.role = (token.role as string) ?? "customer"
      }
      return session
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
}

// Extend the built-in session types
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      restaurantId?: string
      role?: string
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    restaurantId?: string | null
    role?: string
  }
}
