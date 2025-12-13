"use client"

import { useEffect, useState } from "react"

export default function MeelzaFooterDisclaimer() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    let autoShown = false

    const handleScroll = () => {
      if (autoShown || show) return
      const nearBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 80

      if (nearBottom) {
        autoShown = true
        setShow(true)
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    handleScroll()

    return () => window.removeEventListener("scroll", handleScroll)
  }, [show])

  return (
    <footer
      className="border-t border-black/10 bg-white px-4 py-4 text-sm text-black/80 pb-28 md:pb-4"
      dir="rtl"
      lang="ar"
    >
      <div className="mx-auto max-w-6xl text-center space-y-2">
        {/* Visible & SEO-safe */}
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          className="font-medium text-black hover:underline"
        >
          صُنع بكل حب في <span className="font-semibold">Meelza</span> ❤️
        </button>

        {/* Hidden from SEO – client only */}
        {show && (
          <div className="text-xs text-black/70 leading-relaxed">
            <p>
              Meelza منصة بتعرض معلومات عامة عن المطاعم لتسهيل وصول العملاء للمعلومة. الموقع غير تابع للمطعم، وغير
              مسؤولة عن أي تعامل مباشر، وقد يتم تحديث البيانات في أي وقت.
            </p>
          </div>
        )}
      </div>
    </footer>
  )
}
