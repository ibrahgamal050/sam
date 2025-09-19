import { Inter } from "next/font/google"
import Script from "next/script"
import "@/app/globals.css"
import { Analytics } from "@vercel/analytics/next"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

export const metadata = {
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
        {children}

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
</script>
          `}
        </Script>
      </body>
    </html>
  )
}
