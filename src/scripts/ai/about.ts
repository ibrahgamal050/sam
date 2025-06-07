import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import Pages from '@/models/page'; // تأكد من أن هذا الملف يحتوي على الـ schema الخاص بالـ Page

// Load environment variables from .env file
dotenv.config();

// Get the directory name
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Check if API key is available
if (!process.env.PERPLEXITY_API_KEY) {
  console.error("Error: PERPLEXITY_API_KEY is not set in environment variables");
  console.error("Please create a .env file with your Perplexity API key");
  process.exit(1);
}


// دالة توليد محتوى صفحة "حولنا"
async function generateAboutPage(restaurant: IRestaurant): Promise<IAboutPageContent | { content: string }> {
  const prompt = `
    أكتب لي محتوى صفحة "حولنا" لمطعم يسمى "${restaurant.name}" الذي يقع في "${restaurant.location}".
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

  try {
    console.log("Generating content with Perplexity API using fetch...");

    const options = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "sonar-pro",
        messages: [
          {
            role: "system",
            content: "You are a professional content writer specializing in restaurant descriptions."
          },
          {
            role: "user",
            content: prompt
          }
        ]
      })
    };

    const response = await fetch('https://api.perplexity.ai/chat/completions', options);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed with status ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log("Content generated successfully!");

    // Log the raw content to check its structure
    const generatedContent = data.choices && data.choices[0] ? data.choices[0].message.content : '';

    // Print the raw response to debug
    console.log("Raw generated content:", generatedContent);

    // Try to parse the generated content as JSON
    let contentObject: IAboutPageContent;
    try {
      contentObject = JSON.parse(generatedContent);
    } catch (error) {
      console.error("Failed to parse generated content as JSON:", error.message);
      // If it fails, save it as raw text instead of JSON
      contentObject = { content: generatedContent };
    }

    // Save content to JSON file
    const outputDir = path.join(process.cwd(), 'content', 'about');

    // Create directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = path.join(outputDir, `${restaurant.name}.json`);
    fs.writeFileSync(outputPath, JSON.stringify(contentObject, null, 2));

    console.log(`✅ About page generated for ${restaurant.name}`);
    console.log(`File saved to: ${outputPath}`);

    return contentObject;
  } catch (error) {
    console.error("Error generating about page:", error.message);
    throw error;
  }
}

 export default generateAboutPage;
