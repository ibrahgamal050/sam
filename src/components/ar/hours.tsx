import Link from "next/link"
import { ArrowRight, Clock } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function HoursPage() {
  // Get current day
  const days = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"]
  const today = days[new Date().getDay()]

  // Restaurant hours
  const hours = [
    { day: "الاثنين", hours: "١١:٠٠ ص - ١٠:٠٠ م", isToday: today === "الاثنين" },
    { day: "الثلاثاء", hours: "١١:٠٠ ص - ١٠:٠٠ م", isToday: today === "الثلاثاء" },
    { day: "الأربعاء", hours: "١١:٠٠ ص - ١٠:٠٠ م", isToday: today === "الأربعاء" },
    { day: "الخميس", hours: "١١:٠٠ ص - ١١:٠٠ م", isToday: today === "الخميس" },
    { day: "الجمعة", hours: "١١:٠٠ ص - ١١:٠٠ م", isToday: today === "الجمعة" },
    { day: "السبت", hours: "١٠:٠٠ ص - ١١:٠٠ م", isToday: today === "السبت" },
    { day: "الأحد", hours: "١٠:٠٠ ص - ٩:٠٠ م", isToday: today === "الأحد" },
  ]

  // Special hours
  const specialHours = [
    { date: "٢٤ ديسمبر ٢٠٢٣", hours: "١١:٠٠ ص - ٨:٠٠ م", name: "عشية عيد الميلاد" },
    { date: "٢٥ ديسمبر ٢٠٢٣", hours: "مغلق", name: "عيد الميلاد" },
    { date: "٣١ ديسمبر ٢٠٢٣", hours: "١١:٠٠ ص - ١:٠٠ ص", name: "ليلة رأس السنة" },
    { date: "١ يناير ٢٠٢٤", hours: "١٢:٠٠ م - ٩:٠٠ م", name: "يوم رأس السنة" },
  ]

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white shadow-sm">
        <div className="container flex items-center h-16 px-4">
          <Link href="/" className="ml-4">
            <Button variant="ghost" size="icon">
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex items-center">
            <Clock className="h-5 w-5 text-gray-500 ml-2" />
            <h1 className="text-xl font-medium">ساعات العمل</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 space-y-6">
        <Card>
          <CardContent className="p-4">
            <h2 className="font-medium mb-4">ساعات العمل العادية</h2>

            <div className="space-y-3">
              {hours.map((item) => (
                <div
                  key={item.day}
                  className={`flex justify-between items-center p-3 rounded-lg ${
                    item.isToday ? "bg-blue-50 border border-blue-100" : ""
                  }`}
                >
                  <div className="flex items-center">
                    <span className="font-medium">{item.day}</span>
                    {item.isToday && <Badge className="mr-2 bg-blue-500">اليوم</Badge>}
                  </div>
                  <span>{item.hours}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <h2 className="font-medium mb-4">ساعات خاصة والعطلات</h2>

            <div className="space-y-3">
              {specialHours.map((item) => (
                <div
                  key={item.date}
                  className="flex justify-between items-center p-3 rounded-lg border border-gray-100"
                >
                  <div>
                    <span className="font-medium">{item.name}</span>
                    <p className="text-sm text-gray-500">{item.date}</p>
                  </div>
                  <span className={item.hours === "مغلق" ? "text-red-500 font-medium" : ""}>{item.hours}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="bg-gray-100 rounded-lg p-4">
          <h3 className="font-medium mb-2">ساعات المطبخ</h3>
          <p className="text-sm text-gray-600 mb-3">يتوقف مطبخنا عن قبول الطلبات قبل ٣٠ دقيقة من وقت الإغلاق.</p>

          <h3 className="font-medium mb-2">ساعة سعيدة</h3>
          <p className="text-sm text-gray-600">
            الاثنين - الجمعة: ٤:٠٠ م - ٦:٠٠ م
            <br />
            استمتع بأسعار خاصة على مشروبات ومقبلات مختارة!
          </p>
        </div>
      </main>
    </div>
  )
}
