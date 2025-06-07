import { generateText } from "ai"
import { perplexityClient } from "../perplexity-client"
import { cleanJsonResponse } from "../../utils/json-helper"

export async function generateOpeningHours(restaurantName: string) {
  try {
    const prompt = `
Find the opening hours for the restaurant "${restaurantName}".
Return the information as a JSON object with days of the week and corresponding hours.
If you can't find the exact information, provide a reasonable estimate based on typical restaurant hours.

Return ONLY a valid JSON object with this structure:
{
  "monday": {"open": "09:00", "close": "22:00"},
  "tuesday": {"open": "09:00", "close": "22:00"},
  "wednesday": {"open": "09:00", "close": "22:00"},
  "thursday": {"open": "09:00", "close": "22:00"},
  "friday": {"open": "09:00", "close": "23:00"},
  "saturday": {"open": "10:00", "close": "23:00"},
  "sunday": {"open": "10:00", "close": "22:00"}
}

Use 24-hour format for times. If the restaurant is closed on a particular day, use null instead of the open/close object.
`

    const { text } = await generateText({
      model: perplexityClient("sonar-pro"),
      prompt,
      temperature: 0.7,
      maxTokens: 1000,
    })

    return JSON.parse(cleanJsonResponse(text))
  } catch (error) {
    console.error("Error generating opening hours:", error)
    return {
      monday: { open: "11:00", close: "22:00" },
      tuesday: { open: "11:00", close: "22:00" },
      wednesday: { open: "11:00", close: "22:00" },
      thursday: { open: "11:00", close: "22:00" },
      friday: { open: "11:00", close: "23:00" },
      saturday: { open: "11:00", close: "23:00" },
      sunday: { open: "11:00", close: "22:00" },
    }
  }
}
