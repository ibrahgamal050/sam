import type { Metadata } from "next"
import { Inter } from "next/font/google"
import Script from "next/script"
import "@/app/globals.css"
import { Analytics } from "@vercel/analytics/next"

import { AuthProvider } from '@/contexts/auth-context'
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

const metadataBaseUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.NEXT_PUBLIC_ROOT_DOMAIN
    ? `https://${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`
    : undefined) ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:3000"

export const metadata: Metadata = {
  metadataBase: new URL(metadataBaseUrl),
  title: "Meelza",
  description: "منصة إدارة المطاعم",
  other: {
    "google-adsense-account": "ca-pub-8561906539981156",
    "google-site-verification": "7OejGNM3chOCEGjNZIDV3AzB9wFI_gJhHZ1hMolpjy0",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" className={inter.variable} suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased" suppressHydrationWarning>
        <AuthProvider>
          <Analytics />
          <div className="">{children}</div>
       </AuthProvider>

        {/* Google Tag Manager */}
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-3DKRV4XY0P"
        />
        <Script id="gtag-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-3DKRV4XY0P');
          `}
        </Script>
      </body>
    </html>
  )
}
