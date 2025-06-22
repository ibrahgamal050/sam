// app/dashboard/layout.tsx
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import type { ReactNode } from "react"
import { signOut } from "next-auth/react"
import  DashboardHeader  from "@/components/dashboard/dashboard-header"
export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/signin?from=/dashboard")
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50">
           <DashboardHeader nameOrEmail={session.user?.name || session.user?.email || ""} />


      <main>{children}</main>
    </div>
  )
}
