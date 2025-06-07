import fetch from "node-fetch";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import {OpeningHours,BreakTime ,RestaurantHours } from "@/types"
// Load environment variables
dotenv.config();

// Get the directory name
const __dirname = path.dirname(fileURLToPath(import.meta.url));


// دالة للحصول على ساعات عمل المطعم
async function getRestaurantHours(restaurantNames: string | string[]): Promise<Record<string, RestaurantHours>> {
  try {
    // التعامل مع المدخلات سواء كانت سلسلة نصية أو مصفوفة
    const restaurantList = Array.isArray(restaurantNames) ? restaurantNames : [restaurantNames];

    if (restaurantList.length === 0) {
      throw new Error("No restaurant names provided");
    }

    // استخدام أول اسم مطعم في الاتصال بـ API
    const restaurantName = restaurantList[0];

    console.log(`Finding opening hours for "${restaurantName}" using Perplexity API...`);

    const prompt = `
Find the typical opening hours for "${restaurantName}" restaurant in Egypt.
Provide the information in the following JSON format:

{
  "weekdays": {
    "sunday": {
      "open": "[opening time]",
      "close": "[closing time]"
    },
    "monday": {
      "open": "[opening time]",
      "close": "[closing time]"
    },
    "tuesday": {
      "open": "[opening time]",
      "close": "[closing time]"
    },
    "wednesday": {
      "open": "[opening time]",
      "close": "[closing time]"
    },
    "thursday": {
      "open": "[opening time]",
      "close": "[closing time]"
    },
    "friday": {
      "open": "[opening time]",
      "close": "[closing time]"
    },
    "saturday": {
      "open": "[opening time]",
      "close": "[closing time]"
    }
  },
  "isOpen24Hours": [true/false],
  "hasBreakTime": [true/false],
  "breakTime": {
    "start": "[start time of break, if applicable]",
    "end": "[end time of break, if applicable]"
  }
}

If the restaurant is open 24 hours, set all opening times to "00:00" and closing times to "23:59".
If you don't know the exact hours, provide a reasonable estimate based on typical restaurant hours in Egypt.
Return only the JSON object with no additional text.
`;

    const options = {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "sonar-pro",
        messages: [
          {
            role: "system",
            content:
              "You are a professional data generator specializing in business hours data. Always return valid JSON.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    };

    console.log("Sending request to Perplexity API...");
    const response = await fetch("https://api.perplexity.ai/chat/completions", options);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed with status ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log("Received response from Perplexity API");

    // استخراج النص المولد
    const text = data.choices[0].message.content;

    // تحليل استجابة JSON
    let hours: RestaurantHours;
    try {
      // العثور على الكائن JSON في الاستجابة
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        hours = JSON.parse(jsonMatch[0]);
      } else {
        // محاولة تحليل الاستجابة كـ JSON بالكامل
        try {
          hours = JSON.parse(text);
        } catch (e) {
          throw new Error("Could not find JSON object in response");
        }
      }
    } catch (error) {
      console.error("Error parsing JSON response:", error);
      console.log("Raw response:", text);
      throw new Error("Failed to parse hours data from Perplexity response");
    }

    // تنسيق النتيجة مع اسم المطعم
    const formattedName =
      typeof restaurantName === "string" ? restaurantName.replace(/['"]/g, "") : String(restaurantName);

    const result: Record<string, RestaurantHours> = {
      [formattedName]: hours,
    };

    // حفظ البيانات في ملف
    const outputDir = path.join(__dirname, "output");
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = path.join(outputDir, "restaurant-hours.json");
    fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
    console.log(`Restaurant hours saved to ${outputPath}`);

    return result;
  } catch (error) {
    console.error("Error getting restaurant hours:", error);
    throw error;
  }
}

export default getRestaurantHours;
