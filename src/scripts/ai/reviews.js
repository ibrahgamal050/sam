import fetch from "node-fetch"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import dotenv from "dotenv"

// Load environment variables
dotenv.config()

// Get the directory name
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Check if API key is available
if (!process.env.PERPLEXITY_API_KEY) {
  console.error("Error: PERPLEXITY_API_KEY is not set in environment variables")
  console.error("Please create a .env file with your Perplexity API key")
  process.exit(1)
}

/**
 * Clean JSON response from AI to ensure it's valid JSON
 * @param {string} text - Raw text response from AI
 * @returns {string} - Cleaned JSON string
 */
function cleanJsonResponse(text) {
  // Remove any markdown code block markers
  let cleaned = text.replace(/```json|```/g, "")

  // Try to extract JSON object if it's embedded in other text
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/)
  if (jsonMatch) {
    cleaned = jsonMatch[0]
  }

  // Remove any trailing commas in arrays or objects
  cleaned = cleaned.replace(/,(\s*[\]}])/g, "$1")

  return cleaned
}

/**
 * Get restaurant reviews using Perplexity API
 * @param {string|string[]} restaurantNames - Name(s) of the restaurant(s)
 * @returns {Object} - Reviews and ratings in JSON format
 */
async function getRestaurantReviews(restaurantNames) {
  try {
    // Handle both string and array inputs
    const restaurantList = Array.isArray(restaurantNames) ? restaurantNames : [restaurantNames]

    if (restaurantList.length === 0) {
      throw new Error("No restaurant names provided")
    }

    // Use the first restaurant name for the API call
    const restaurantName = restaurantList[0]

    console.log(`Finding reviews for "${restaurantName}" using Perplexity API...`)

    const prompt = `
Find customer reviews and ratings for the restaurant "${restaurantName}".
Provide an overall rating and a few sample reviews.

Return ONLY a valid JSON object with this structure:
{
  "overallRating": 4.5,
  "totalReviews": 120,
  "sampleReviews": [
    {
      "author": "John D.",
      "rating": 5,
      "comment": "Excellent food and service!",
      "date": "2023-05-15"
    },
    {
      "author": "Sarah M.",
      "rating": 4,
      "comment": "Great atmosphere but slightly overpriced.",
      "date": "2023-04-22"
    }
  ]
}

Include at least 3 sample reviews with varying ratings.
`

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
            content: "You are a helpful assistant that provides restaurant information in JSON format.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    }

    console.log("Sending request to Perplexity API...")
    const response = await fetch("https://api.perplexity.ai/chat/completions", options)

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`API request failed with status ${response.status}: ${errorText}`)
    }

    const data = await response.json()
    console.log("Received response from Perplexity API")

    // Extract the generated text
    const text = data.choices[0].message.content

    // Parse the JSON response
    let reviews
    try {
      const cleanedJson = cleanJsonResponse(text)
      reviews = JSON.parse(cleanedJson)

      // Validate the structure
      validateReviewsStructure(reviews)
    } catch (error) {
      console.error("Error parsing JSON response:", error)
      console.log("Raw response:", text)
      console.log("Cleaned response:", cleanJsonResponse(text))
      throw new Error("Failed to parse reviews data from Perplexity response")
    }

    // Save to file
    const outputDir = path.join(process.cwd(), "output")
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }

    // Make sure restaurantName is a string before using replace
    const formattedName =
      typeof restaurantName === "string"
        ? restaurantName.replace(/\s+/g, "-").toLowerCase()
        : String(restaurantName).replace(/\s+/g, "-").toLowerCase()

    const outputPath = path.join(outputDir, `${formattedName}-reviews.json`)
    fs.writeFileSync(outputPath, JSON.stringify(reviews, null, 2))
    console.log(`Restaurant reviews saved to ${outputPath}`)

    return reviews
  } catch (error) {
    console.error("Error getting restaurant reviews:", error)
    throw error
  }
}

/**
 * Validate the structure of the reviews object
 * @param {Object} reviews - Reviews object to validate
 */
function validateReviewsStructure(reviews) {
  if (typeof reviews.overallRating !== "number") {
    throw new Error("Missing or invalid overallRating")
  }

  if (typeof reviews.totalReviews !== "number") {
    throw new Error("Missing or invalid totalReviews")
  }

  if (!Array.isArray(reviews.sampleReviews)) {
    throw new Error("Missing or invalid sampleReviews array")
  }

  if (reviews.sampleReviews.length < 1) {
    throw new Error("sampleReviews array is empty")
  }

  // Check each review
  reviews.sampleReviews.forEach((review, index) => {
    if (!review.author) {
      throw new Error(`Review ${index} is missing author`)
    }

    if (typeof review.rating !== "number") {
      throw new Error(`Review ${index} has invalid rating`)
    }

    if (!review.comment) {
      throw new Error(`Review ${index} is missing comment`)
    }

    if (!review.date) {
      throw new Error(`Review ${index} is missing date`)
    }
  })
}

export default getRestaurantReviews
