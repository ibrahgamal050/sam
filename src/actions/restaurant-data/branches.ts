import { generateText } from "ai"
import { perplexityClient } from "./perplexity-client"
import { cleanJsonResponse } from "./json-helper"

export async function generateBranches(restaurantName: string) {
  try {
    const prompt = `
Generate realistic branch information for a restaurant called "${restaurantName}" in both English and Arabic.

Create 2-4 branches for the restaurant, with one marked as the main branch. For each branch, provide:
1. Branch name in English and Arabic (could be based on location, e.g., "${restaurantName} - Downtown")
2. Address in English and Arabic
3. Approximate latitude and longitude coordinates
4. Phone number
5. Working hours in a readable format

Return ONLY a valid JSON object with this structure:
[
  {
    "name": {
      "en": "Branch name in English",
      "ar": "اسم الفرع بالعربية"
    },
    "location": {
      "address": {
        "en": "Address in English",
        "ar": "العنوان بالعربية"
      },
      "latitude": 24.7136,
      "longitude": 46.6753
    },
    "phone": "+966 12 345 6789",
    "workingHours": "Sunday-Thursday: 10:00 AM - 11:00 PM, Friday-Saturday: 1:00 PM - 12:00 AM",
    "isMainBranch": true
  }
]

Make sure the information is realistic and appropriate for a restaurant. Use realistic coordinates for major cities. Make the branch names and addresses appropriate for the restaurant's likely cuisine type.
Do not include any explanations or notes outside the JSON array.
`

    const { text } = await generateText({
      model: perplexityClient("sonar-pro"),
      prompt,
      temperature: 0.7,
      maxTokens: 2000,
    })

    return JSON.parse(cleanJsonResponse(text))
  } catch (error) {
    console.error("Error generating branches:", error)
    
  }
}
