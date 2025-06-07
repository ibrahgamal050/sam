import { generateText } from "ai"
import { perplexityClient } from "./perplexity-client"
import { cleanJsonResponse } from "./json-helper"

export async function generateAboutUs(restaurantName: string) {
  try {
    const prompt = `
اكتب لي صفحة "من نحن" لمطعم اسمه "${restaurantName}" باللغتين العربية والإنجليزية.

المحتوى يجب أن يتحدث عن:
- نوع الأكل المقدم (مثلاً مطبخ يمني، إيطالي، إلخ)
- جو المطعم (عائلي، مودرن، تقليدي...)
- خبرة المطعم أو رسالته
- لماذا يحب الناس المطعم

رجاءً أعد الرد بصيغة JSON كالتالي:

{
  "title": {
    "en": "About Us",
    "ar": "من نحن"
  },
  "content": {
    "en": "English content here...",
    "ar": "المحتوى العربي هنا..."
  }
}

اكتب النص بأسلوب جذاب وترحيبي، ولا تضع أي ملاحظات خارج JSON.
`

    const { text } = await generateText({
      model: perplexityClient("sonar-pro"),
      prompt,
      temperature: 0.7,
      maxTokens: 2000,
    })

    return JSON.parse(cleanJsonResponse(text))
  } catch (error) {
    console.error("Error generating about us content:", error)
    return {
      title: {
        en: "About Us",
        ar: "من نحن",
      },
      content: {
        en: `Welcome to ${restaurantName}, where we are passionate about providing a delightful dining experience. Our restaurant offers delicious cuisine in a welcoming atmosphere. We take pride in our quality ingredients and exceptional service. Visit us today to discover why our customers keep coming back!`,
        ar: `مرحبًا بكم في ${restaurantName}، حيث نحن شغوفون بتقديم تجربة طعام رائعة. يقدم مطعمنا مأكولات لذيذة في أجواء ترحيبية. نحن نفتخر بمكوناتنا عالية الجودة وخدمتنا الاستثنائية. قم بزيارتنا اليوم لتكتشف لماذا يعود عملاؤنا باستمرار!`,
      },
    }
  }
}
