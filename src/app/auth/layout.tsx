import type { ReactNode } from "react"

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex min-h-screen flex-col">
        <header className="border-b bg-white py-4">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold">Restaurant Menu Manager</h1>
            </div>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t bg-white py-4">
          <div className="container mx-auto px-4">
            <p className="text-center text-sm text-gray-500">© {new Date().getFullYear()} Restaurant Menu Manager</p>
          </div>
        </footer>
      </div>
    </div>
  )
}
