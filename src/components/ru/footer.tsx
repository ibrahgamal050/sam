import Link from "next/link"
import {
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  MapPin,
  Phone,
  Mail,
} from "lucide-react"

export function Footer() {
  return (
    <footer
      dir="ltr"
      className="bg-gradient-to-br from-[#0F0B30] to-[#1F1259] text-white py-12 mt-auto"
    >
      <div className="container mx-auto px-4">

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          {/* Logo */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Link
                href="/"
                className="px-4 py-2 bg-[#6C5CE7] text-white text-xl font-bold rounded-full hover:bg-[#5A4BD1] transition-colors"
              >
                Корзина
              </Link>
            </div>

            <p dir="rtl" className="text-[#B8B2E5] mt-4 text-sm">
              Платформа "Корзина" предоставляет лучший опыт бронирования ресторанов с удобным сервисом и разнообразными вариантами.
            </p>

            <div className="flex space-x-3 pt-2">
              <Link href="#" className="bg-[#1A1346] p-2 rounded-full hover:bg-[#6C5CE7]">
                <Linkedin className="h-5 w-5" />
              </Link>
              <Link href="#" className="bg-[#1A1346] p-2 rounded-full hover:bg-[#6C5CE7]">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link href="#" className="bg-[#1A1346] p-2 rounded-full hover:bg-[#6C5CE7]">
                <Instagram className="h-5 w-5" />
              </Link>
              <Link href="#" className="bg-[#1A1346] p-2 rounded-full hover:bg-[#6C5CE7]">
                <Facebook className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold">Быстрые ссылки</h3>
            <ul className="space-y-2 text-[#B8B2E5]">

              <li><Link href="#">Главная</Link></li>
              <li><Link href="#">Рестораны</Link></li>
              <li><Link href="#">Акции</Link></li>
              <li><Link href="#">Мобильное приложение</Link></li>
              <li><Link href="#">FAQ</Link></li>

            </ul>
          </div>

          {/* Categories */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold">Категории ресторанов</h3>
            <ul className="space-y-2 text-[#B8B2E5]">

              <li><Link href="#">Египетская кухня</Link></li>
              <li><Link href="#">Итальянская кухня</Link></li>
              <li><Link href="#">Азиатская кухня</Link></li>
              <li><Link href="#">Фастфуд</Link></li>
              <li><Link href="#">Кафе</Link></li>

            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold">Контакты</h3>

            <ul className="space-y-4 text-[#B8B2E5]">

              <li className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-[#6C5CE7]" />
                <span>Каир, Египет</span>
              </li>

              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-[#6C5CE7]" />
                <span dir="ltr">+20 123 456 7890</span>
              </li>

              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-[#6C5CE7]" />
                <span>info@korzina.com</span>
              </li>

            </ul>
          </div>

        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-[#2A2162]">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">

            <p className="text-sm text-[#B8B2E5]">
              © {new Date().getFullYear()} Корзина
            </p>

          </div>
        </div>

      </div>
    </footer>
  )
}