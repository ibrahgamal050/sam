import Link from "next/link"
import { Facebook, Instagram, Linkedin, Twitter, MapPin, Phone, Mail } from "lucide-react"

export function Footer() {
  return (
    <footer dir="ltr" className="bg-gradient-to-br  from-[#0F0B30] to-[#1F1259] text-white py-12 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and About Column */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Link
                href="/"
                className="px-4 py-2 bg-[#6C5CE7] text-white text-xl font-bold rounded-full hover:bg-[#5A4BD1] transition-colors"
              >
                Meelza
              </Link>
            </div>
            <p  dir="rtl"  className="text-[#B8B2E5] mt-4 text-sm">
              منصة ميلزا تقدم أفضل تجربة حجز المطاعم في مصر، مع خيارات متنوعة وخدمة ممتازة.
            </p>
            <div className="flex space-x-3 pt-2">
              <Link href="#" className="bg-[#1A1346] p-2 rounded-full hover:bg-[#6C5CE7] transition-all">
                <Linkedin className="h-5 w-5" />
              </Link>
              <Link href="#" className="bg-[#1A1346] p-2 rounded-full hover:bg-[#6C5CE7] transition-all">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link href="#" className="bg-[#1A1346] p-2 rounded-full hover:bg-[#6C5CE7] transition-all">
                <Instagram className="h-5 w-5" />
              </Link>
              <Link href="#" className="bg-[#1A1346] p-2 rounded-full hover:bg-[#6C5CE7] transition-all">
                <Facebook className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* //Quick Links Column 
          <div className="space-y-4" dir="rtl">
            <h3 className="text-lg font-bold mb-4 border-r-4 border-[#6C5CE7] pr-3">روابط سريعة</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="#"
                  className="text-[#B8B2E5] hover:text-white hover:translate-x-1 transition-all inline-block"
                >
                  الصفحة الرئيسية
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-[#B8B2E5] hover:text-white hover:translate-x-1 transition-all inline-block"
                >
                  استكشف المطاعم
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-[#B8B2E5] hover:text-white hover:translate-x-1 transition-all inline-block"
                >
                  العروض الخاصة
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-[#B8B2E5] hover:text-white hover:translate-x-1 transition-all inline-block"
                >
                  تطبيق الجوال
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-[#B8B2E5] hover:text-white hover:translate-x-1 transition-all inline-block"
                >
                  الأسئلة الشائعة
                </Link>
              </li>
            </ul>
          </div>

          // Categories Column 
          <div className="space-y-4" dir="rtl">
            <h3 className="text-lg font-bold mb-4 border-r-4 border-[#6C5CE7] pr-3">فئات المطاعم</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="#"
                  className="text-[#B8B2E5] hover:text-white hover:translate-x-1 transition-all inline-block"
                >
                  مطاعم مصرية
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-[#B8B2E5] hover:text-white hover:translate-x-1 transition-all inline-block"
                >
                  مطاعم إيطالية
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-[#B8B2E5] hover:text-white hover:translate-x-1 transition-all inline-block"
                >
                  مطاعم آسيوية
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-[#B8B2E5] hover:text-white hover:translate-x-1 transition-all inline-block"
                >
                  مطاعم سريعة
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-[#B8B2E5] hover:text-white hover:translate-x-1 transition-all inline-block"
                >
                  كافيهات
                </Link>
              </li>
            </ul>
          </div>

          //Contact Column 
          <div className="space-y-4" dir="rtl">
            <h3 className="text-lg font-bold mb-4 border-r-4 border-[#6C5CE7] pr-3">اتصل بنا</h3>
            <ul className="space-y-4">
              <li className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-[#6C5CE7]" />
                <span className="text-[#B8B2E5]">القاهرة، مصر</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-[#6C5CE7]" />
                <span  dir="ltr" className="text-[#B8B2E5]">+20 123 456 7890</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-[#6C5CE7]" />
                <span className="text-[#B8B2E5]">info@meelza.com</span>
              </li>
            </ul>
          </div>
            **/}
        </div>
    
        {/* Bottom Section */}
        <div dir="rtl" className="mt-12 mb-8 pt-8 border-t border-[#2A2162]">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-[#B8B2E5]">© {new Date().getFullYear()} ميلزا مصر</p>
            <div className="flex space-x-6 space-x-reverse">
              <Link href="#" className="text-[#B8B2E5] hover:text-white transition-colors">
                عنا
              </Link>
              <Link href="#" className="text-[#B8B2E5] hover:text-white transition-colors">
                الاحكام والشروط
              </Link>
              <Link href="#" className="text-[#B8B2E5] hover:text-white transition-colors">
                الخصوصية
              </Link>
              <Link href="#" className="text-[#B8B2E5] hover:text-white transition-colors">
                وظائف
              </Link>
              <Link href="#" className="text-[#B8B2E5] hover:text-white transition-colors">
                انضم لنا
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative element */}
    </footer>
  )
}
