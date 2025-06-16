"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ISEO } from "@/types"
import { Label } from "@/components/ui/label" 

interface SEOEditorProps {
  seo: ISEO
  onChange: (updatedSeo: ISEO) => void
}

export function SEOEditor({ seo, onChange }: SEOEditorProps) {
  const handleChange = (field: keyof ISEO, value: string | string[]) => {
    if (field === "description" && typeof value === "string") {
      value = value.slice(0, 160)
    }
    onChange({
      ...seo,
      [field]: value,
    })
  }

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-lg">
      <CardHeader className="pb-6">
        <CardTitle className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          إعدادات تحسين محركات البحث (SEO)
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-8">
        {/* Basic SEO Section */}
        <div className="space-y-6">
          <div className="border-b border-gray-200 pb-2">
            <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              المعلومات الأساسية
            </h3>
          </div>
          
          <div className="grid grid-cols-1 gap-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                عنوان الصفحة
                <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                value={seo.title || ""}
                onChange={(e) => handleChange("title", e.target.value)}
                placeholder="أدخل عنوان الصفحة هنا"
                className="h-11 text-right focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
              <p className="text-xs text-gray-500 text-right">يُفضل أن يكون بين 50-60 حرف</p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                وصف الصفحة
                <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="description"
                className="min-h-[100px] text-right resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                value={seo.description || ""}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="أدخل وصف مختصر وجذاب للصفحة"
              />
              <p className="text-xs text-gray-500 text-right">يُفضل أن يكون بين 150-160 حرف</p>
            </div>

            {/* Keywords */}
            <div className="space-y-2">
              <Label htmlFor="keywords" className="text-sm font-medium text-gray-700">
                الكلمات المفتاحية
              </Label>
              <Input
                id="keywords"
                value={seo.keywords?.join(", ") || ""}
                onChange={(e) =>
                  handleChange(
                    "keywords",
                    e.target.value.split(",").map((k) => k.trim())
                  )
                }
                placeholder="كلمة مفتاحية 1, كلمة مفتاحية 2, كلمة مفتاحية 3"
                className="h-11 text-right focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
              <p className="text-xs text-gray-500 text-right">افصل بين الكلمات بفاصلة</p>
            </div>

            {/* Canonical URL */}
            <div className="space-y-2">
              <Label htmlFor="canonical_url" className="text-sm font-medium text-gray-700">
                الرابط الأساسي (Canonical URL)
              </Label>
              <Input
                id="canonical_url"
                value={seo.canonical_url || ""}
                onChange={(e) => handleChange("canonical_url", e.target.value)}
                placeholder="https://example.com/page"
                className="h-11 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                dir="ltr"
              />
            </div>
          </div>
        </div>

        {/* Open Graph Section */}
        <div className="space-y-6">
          <div className="border-b border-gray-200 pb-2">
            <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
              Open Graph (Facebook)
            </h3>
            <p className="text-sm text-gray-500 mt-1">تحسين عرض المحتوى عند المشاركة على فيسبوك</p>
          </div>
          
          <div className="grid grid-cols-1 gap-6">
            {/* OG Title */}
            <div className="space-y-2">
              <Label htmlFor="og_title" className="text-sm font-medium text-gray-700">
                عنوان Open Graph
              </Label>
              <Input
                id="og_title"
                value={seo.og_title || ""}
                onChange={(e) => handleChange("og_title", e.target.value)}
                placeholder="عنوان جذاب للمشاركة على فيسبوك"
                className="h-11 text-right focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            {/* OG Description */}
            <div className="space-y-2">
              <Label htmlFor="og_description" className="text-sm font-medium text-gray-700">
                وصف Open Graph
              </Label>
              <Textarea
                id="og_description"
                className="min-h-[80px] text-right resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                value={seo.og_description || ""}
                onChange={(e) => handleChange("og_description", e.target.value)}
                placeholder="وصف مختصر للمشاركة على فيسبوك"
              />
            </div>

            {/* OG Image */}
            <div className="space-y-2">
              <Label htmlFor="og_image" className="text-sm font-medium text-gray-700">
                صورة Open Graph
              </Label>
              <Input
                id="og_image"
                value={seo.og_image || ""}
                onChange={(e) => handleChange("og_image", e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="h-11 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                dir="ltr"
              />
              <p className="text-xs text-gray-500 text-right">الحجم المُوصى به: 1200x630 بكسل</p>
            </div>
          </div>
        </div>

        {/* Twitter Section */}
        <div className="space-y-6">
          <div className="border-b border-gray-200 pb-2">
            <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
              <svg className="w-5 h-5 text-sky-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
              </svg>
              Twitter Cards
            </h3>
            <p className="text-sm text-gray-500 mt-1">تحسين عرض المحتوى عند المشاركة على تويتر</p>
          </div>
          
          <div className="grid grid-cols-1 gap-6">
            {/* Twitter Title */}
            <div className="space-y-2">
              <Label htmlFor="twitter_title" className="text-sm font-medium text-gray-700">
                عنوان Twitter
              </Label>
              <Input
                id="twitter_title"
                value={seo.twitter_title || ""}
                onChange={(e) => handleChange("twitter_title", e.target.value)}
                placeholder="عنوان جذاب للمشاركة على تويتر"
                className="h-11 text-right focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            {/* Twitter Description */}
            <div className="space-y-2">
              <Label htmlFor="twitter_description" className="text-sm font-medium text-gray-700">
                وصف Twitter
              </Label>
              <Textarea
                id="twitter_description"
                className="min-h-[80px] text-right resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                value={seo.twitter_description || ""}
                onChange={(e) => handleChange("twitter_description", e.target.value)}
                placeholder="وصف مختصر للمشاركة على تويتر"
              />
            </div>

            {/* Twitter Image */}
            <div className="space-y-2">
              <Label htmlFor="twitter_image" className="text-sm font-medium text-gray-700">
                صورة Twitter
              </Label>
              <Input
                id="twitter_image"
                value={seo.twitter_image || ""}
                onChange={(e) => handleChange("twitter_image", e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="h-11 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                dir="ltr"
              />
              <p className="text-xs text-gray-500 text-right">الحجم المُوصى به: 1200x600 بكسل</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}