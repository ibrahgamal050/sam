import Image from "next/image"
import { Award, Heart, Star, Users, Utensils } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface AboutPageProps {
  data:IPage 
}
export interface IPage {
  components: {
    component_id: string;
    type: string;
    props: Record<string, any>; // أو ممكن تعملها أقوى بنوع مخصص لكل type
    position?: number;
  }[];
}
export default function AboutPage({ data }: AboutPageProps) {
  return (
    <div className="   rtl">
      {/* Main Content */}
      {data.components.map((component) => {
  const { type, props } = component;

  switch (type) {
    case 'header':
      return (
        <div key={component.component_id} className="relative  w-full h-48">
         
          <Image
            src={`http://localhost:3000/images${props.heroImage}`}
            alt="صورة المطعم"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
            <div className="p-4 text-white">
              <h2 className="text-2xl font-bold">{props.title}</h2>
              <p className="text-sm opacity-90">{props.subtitle}</p>
            </div>
          </div>
        
         
        </div>
      );

    case 'story':
      return (
        <div key={component.component_id} className="p-4">
           <section>
            <div className="flex items-center mb-3">
              <Utensils className="h-5 w-5 ml-2 text-orange-600" />
              <h2 className="text-lg font-bold">{props.title}</h2>
            </div>
          
            <Card className="rounded-2xl shadow">
            {props.contentParagraphs.map((paragraph, idx) => (
              <CardContent className="p-4">
                <p className="text-sm text-gray-700 leading-relaxed">
                {paragraph} </p>
                
              </CardContent>
               ))}
            </Card>
            
          </section>

 
        </div>
      );

    case 'mission':
      return (
        <div key={component.component_id} className="p-4">
          <section>
            <div className="flex items-center mb-3">
              <Star className="h-5 w-5 ml-2 text-orange-600" />
              <h2 className="text-lg font-bold">{props.title}</h2>
            </div>
            <Card className="rounded-2xl shadow">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="bg-orange-100 p-3 rounded-full">
                    <Heart className="h-6 w-6 text-orange-600" />
                  </div>
                  <p className="mr-4 text-sm text-gray-700 leading-relaxed">
                  {props.content}
                  </p>
                </div>
              </CardContent>
            </Card>
          </section>
        
        </div>
      );

    case 'values':
      return (
        <div key={component.component_id} className="p-4">
           <section>
            <div className="flex items-center mb-3">
              <Award className="h-5 w-5 ml-2 text-orange-600" />
              <h2 className="text-lg font-bold">{props.title}</h2>
            </div>
            <Card className="rounded-2xl shadow">
              <CardContent className="p-4 space-y-3">
              {props.items.map((item) => (
                <div   key={item.id} className="flex">
                  <Badge className="bg-orange-600 h-6 w-6 rounded-full flex items-center justify-center p-0 ml-3">
                  {item.number}
                  </Badge>
                  <div>
                    <h3 className="font-bold text-sm">{item.title}</h3>
                    <p className="text-xs text-gray-600 mt-1">
                    {item.description}
                       </p>
                  </div>
                </div>
                 ))}

               
              </CardContent>
            </Card>
          </section>
       
        </div>
      );
      case 'team':
        return(
          <div key={component.component_id} className="p-4">
         <section>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <Users className="h-5 w-5 ml-2 text-orange-600" />
                <h2 className="text-lg font-bold">فريقنا</h2>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <Card className="overflow-hidden rounded-2xl shadow">
                <div className="relative w-full h-32">
                  <Image
                    src="/placeholder.svg?height=200&width=200&text=أحمد"
                    alt="الشيف أحمد"
                    fill
                    className="object-cover"
                  />
                </div>
                <CardContent className="p-3">
                  <h3 className="font-bold text-sm">أحمد محمد</h3>
                  <p className="text-xs text-gray-600">الشيف التنفيذي</p>
                </CardContent>
              </Card>

              <Card className="overflow-hidden rounded-2xl shadow">
                <div className="relative w-full h-32">
                  <Image
                    src="/placeholder.svg?height=200&width=200&text=سارة"
                    alt="سارة"
                    fill
                    className="object-cover"
                  />
                </div>
                <CardContent className="p-3">
                  <h3 className="font-bold text-sm">سارة أحمد</h3>
                  <p className="text-xs text-gray-600">مديرة المطعم</p>
                </CardContent>
              </Card>

              <Card className="overflow-hidden rounded-2xl shadow">
                <div className="relative w-full h-32">
                  <Image
                    src="/placeholder.svg?height=200&width=200&text=محمد"
                    alt="محمد"
                    fill
                    className="object-cover"
                  />
                </div>
                <CardContent className="p-3">
                  <h3 className="font-bold text-sm">محمد علي</h3>
                  <p className="text-xs text-gray-600">شيف المعجنات</p>
                </CardContent>
              </Card>

              <Card className="overflow-hidden rounded-2xl shadow">
                <div className="relative w-full h-32">
                  <Image
                    src="/placeholder.svg?height=200&width=200&text=ليلى"
                    alt="ليلى"
                    fill
                    className="object-cover"
                  />
                </div>
                <CardContent className="p-3">
                  <h3 className="font-bold text-sm">ليلى خالد</h3>
                  <p className="text-xs text-gray-600">مديرة خدمة العملاء</p>
                </CardContent>
              </Card>
            </div>
          </section>
      
       </div>

        )

    default:
      return null;
  }
})}

    </div>
  )
}
