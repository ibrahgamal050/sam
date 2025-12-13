import "server-only"
import Link from "next/link"
import type { FooterBlock } from "@/types/blocks"
import { cn } from "@/lib/utils"

export default function Footer(block: FooterBlock) {
  const cta =
    block.cta ??
    ((block as any).cta
      ? { text: (block as any).cta.text ?? (block as any).cta.label, href: (block as any).cta.href }
      : undefined)
  const gradientStyle = block.gradient
    ? {
        backgroundImage: `linear-gradient(120deg, ${block.gradient.from ?? "#ea580c"}, ${
          block.gradient.to ?? "#c2410c"
        })`,
      }
    : undefined

  return (
    <footer data-block-type="footer">
      <div
        className={cn(
          block.theme?.ribbon ?? "bg-green-600",
          "h-1 w-full",
          block.theme?.ribbon == null && "bg-[#16a34a]",
        )}
      />
      <div
        className={cn(
          "text-white",
          block.theme?.background ?? "bg-neutral-900",
        )}
        style={gradientStyle}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid gap-8 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
            <div>
              <p className="text-xl font-extrabold">
                {block.brandName ?? "Meelza Restaurant"}
              </p>
              {block.about && (
                <p className="mt-2 text-sm text-white/80">{block.about}</p>
              )}
            </div>
            <div>
              <p className="font-semibold mb-2">روابط</p>
              <ul className="space-y-2 text-sm text-white/80">
                {block.links?.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="hover:underline">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-semibold mb-2">تابعنا</p>
              <ul className="space-y-2 text-sm text-white/80">
                {block.follow?.map((social) => (
                  <li key={social.href}>
                    <a
                      href={social.href}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:underline"
                    >
                      {social.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col items-start gap-4">
              {cta && (
                <Link
                  href={cta.href}
                  className="inline-flex w-full items-center justify-center rounded-full bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
                >
                  {cta.text ?? "اطلب الآن"}
                </Link>
              )}
              {cta?.href && cta?.newTab && (
                <span className="text-xs text-white/70">
                  سيتم فتح الرابط في نافذة جديدة
                </span>
              )}
            </div>
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 text-xs text-white/70">
            <span>
              © {new Date().getFullYear()} {block.brandName ?? "Meelza"}. All rights
              reserved.
            </span>
            {block.finePrint && <span>{block.finePrint}</span>}
          </div>
        </div>
      </div>
    </footer>
  )
}
