import { generateText } from "ai"
import { perplexityClient } from "./perplexity-client"
import { cleanJsonResponse } from "./json-helper"

export async function generateBasicRestaurantInfo(restaurantName: string) {
  try {
    // نص الـ prompt لتحسين وضوح التعليمات
    const prompt = `
I need basic information about a restaurant called "${restaurantName}" in both English and Arabic. 
Please search for and provide the following information in a structured JSON format:

1. A detailed description of the restaurant (cuisine type, atmosphere, specialties)
2. Contact information (phone, email if available)
3. Location (full address and approximate latitude/longitude if possible)
4. Website URL
5. Social media links (Facebook, Instagram, TikTok, Twitter)
6. SEO metadata (title, description, keywords)

Additionally, provide Arabic translations for:
1. The restaurant name
2. The description
3. SEO metadata (title, description, keywords)

If you can't find specific information, please make a reasonable guess based on the restaurant name and type.
For example, if it's called "Yemeni Corner", assume it serves Yemeni cuisine.

Return ONLY a valid JSON object with the following structure:
{
  "description": "Detailed description in English...",
  "phone": "Phone number",
  "email": "Email address",
  "website": "Website URL",
  "location": {
    "address": "Full address",
    "latitude": 0.0,
    "longitude": 0.0
  },
  "social": {
    "facebook": "Facebook URL",
    "instagram": "Instagram URL",
    "tiktok": "TikTok URL",
    "twitter": "Twitter URL"
  },
  "meta": {
    "title": "SEO title in English",
    "description": "SEO description in English",
    "keywords": "keyword1, keyword2, keyword3"
  },
  "arName": "Restaurant name in Arabic",
  "arDescription": "Detailed description in Arabic",
  "arMeta": {
    "title": "SEO title in Arabic",
    "description": "SEO description in Arabic",
    "keywords": "keyword1, keyword2, keyword3 in Arabic"
  },
  "logo": "/default-logo.png",
  "coverImage": "/default-cover.jpg"
}

Do not include any explanations or notes outside the JSON object.
`

    // الحصول على البيانات من الـ API أو النظام
    const { text } = await generateText({
      model: perplexityClient("sonar-pro"),
      prompt,
      temperature: 0.7,
      maxTokens: 2000,
    })

    // التأكد من أن الاستجابة عبارة عن JSON صالح
    const jsonResponse = cleanJsonResponse(text)
    const parsedData = JSON.parse(jsonResponse)

    return parsedData
  } catch (error) {
    console.error("Error generating basic restaurant info:", error)

    // إرجاع القيم الافتراضية في حالة حدوث خطأ
    return {
      description: `${restaurantName} is a restaurant offering delicious cuisine and a welcoming atmosphere.`,
      phone: "",
      email: "",
      website: "",
      location: {
        address: "",
        latitude: null,
        longitude: null,
      },
      social: {
        facebook: "",
        instagram: "",
        tiktok: "",
        twitter: "",
      },
      meta: {
        title: `${restaurantName} - Restaurant`,
        description: `${restaurantName} - A delightful dining experience.`,
        keywords: `${restaurantName}, restaurant, dining`,
      },
      arName: restaurantName,
      arDescription: `${restaurantName} هو مطعم يقدم مأكولات لذيذة وأجواء ترحيبية.`,
      arMeta: {
        title: `${restaurantName} - مطعم`,
        description: `${restaurantName} - تجربة طعام رائعة.`,
        keywords: `${restaurantName}, مطعم, طعام`,
      },
      logo: "/default-logo.png",
      coverImage: "/default-cover.jpg",
    }
  }
}
