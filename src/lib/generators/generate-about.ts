// مثال: /lib/generators/generate-about.ts
import fetch from 'node-fetch';
import type { IRestaurant } from '@/types/restaurant';

async function generateAboutPage(restaurant: IRestaurant) {
   const prompt = `
    أكتب لي محتوى صفحة "حولنا" لمطعم يسمى "${restaurant.name}" الذي يقع في "${restaurant.branches}".
    اجعل المحتوى يشتمل على الأقسام التالية مع تقديم تفاصيل دقيقة ومقنعة:

    1. **العنوان:** يجب أن يتضمن عنوانًا يشد الانتباه ويعكس هوية المطعم.
    2. **العنوان الفرعي:** وصف مختصر وجذاب عن المطعم يُظهر المزايا الفريدة التي تميزه عن باقي المطاعم.
    3. **القصة:** احكي عن بداية هذا المطعم. ما هي فكرة تأسيسه؟ هل كان هناك تحديات خاصة؟ كيف تطور حتى وصل إلى ما هو عليه اليوم؟
    4. **المهمة:** ما هو الهدف الأساسي للمطعم؟ ماذا يسعى لتحقيقه لعملائه؟ كيف يقدم قيمة مضافة للمجتمع؟
    5. **القيم:** اذكر القيم الجوهرية التي يلتزم بها المطعم في كل جوانب عمله (مثل الجودة، الابتكار، الاستدامة، الاهتمام بالتفاصيل).
    6. **الفريق:** تحدث عن أعضاء الفريق وأدوارهم في نجاح المطعم. من هو الشيف المبدع؟ كيف يعمل الفريق معًا لتحقيق التميز؟

    بعد كتابة المحتوى، أعد إرسال النص بتنسيق JSON كما يلي:

    {
        "pageType": "about",
        "content": {
            "header": {
                "title": "[العنوان هنا]",
                "subtitle": "[العنوان الفرعي هنا]",
                "heroImage": "[رابط الصورة هنا]"
            },
            "story": {
                "title": "قصة المطعم",
                "contentParagraphs": [
                    "[قصة المطعم هنا]"
                ]
            },
            "mission": {
                "title": "مهمتنا",
                "content": "[مهمة المطعم هنا]"
            },
            "values": {
                "title": "قيمنا",
                "items": [
                    {
                        "id": 1,
                        "number": "1",
                        "title": "جودة الطعام",
                        "description": "[وصف الجودة هنا]"
                    },
                    {
                        "id": 2,
                        "number": "2",
                        "title": "خدمة العملاء",
                        "description": "[وصف خدمة العملاء هنا]"
                    }
                ]
            },
            "team": {
                "title": "فريقنا",
                "members": [
                    {
                        "id": 1,
                        "name": "[اسم العضو]",
                        "role": "[دور العضو]",
                        "description": "[وصف العضو]"
                    }
                ]
            }
        }
    }

    يرجى التأكد من أن JSON يحتوي على جميع المعلومات المطلوبة مع الحفاظ على هيكل البيانات بشكل صحيح.
`;
  const response = await fetch("https://api.perplexity.ai/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "sonar-pro",
      messages: [
        { role: "system", content: "You are a professional content writer..." },
        { role: "user", content: prompt },
      ],
    }),
  });

  const data = await response.json();
  return JSON.parse(data.choices[0].message.content);
}

export default generateAboutPage;
