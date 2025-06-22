'use client'

import { signOut } from "next-auth/react"

interface Props {
  nameOrEmail: string
}

export default function DashboardHeader({ nameOrEmail }: Props) {
  return (
    <header className="mb-6 flex items-center justify-between">
      <h1 className="text-xl font-semibold">مرحبا {nameOrEmail}</h1>
      <button
        onClick={() => signOut()}
        className="text-sm bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
      >
        تسجيل الخروج
      </button>
    </header>
  )
}