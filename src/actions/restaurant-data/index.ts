import { generateBasicRestaurantInfo } from "./basic-info"
import { generateOpeningHours } from "./opening-hours"
import { generateAboutUs } from "./about-us"
import { generateBranches } from "./branches"

/**
 * Generates a comprehensive restaurant profile by combining data from multiple specialized prompts
 */
export async function generateComprehensiveRestaurantProfile(restaurantName: string) {
  try {
    // 1. Get basic information (description, contact, location, social media, SEO)
    const basicInfo = await generateBasicRestaurantInfo(restaurantName)

    // 2. Get opening hours
    const openingHours = await generateOpeningHours(restaurantName)

    



    // 7. Get about us content
    const aboutUs = await generateAboutUs(restaurantName)
    // 9. Get branches information
    const branches = await generateBranches(restaurantName)

    // Merge all information into a comprehensive profile
    return {
      ...basicInfo,
      openingHours,

      
      aboutUs,
    
      branches,
    }
  } catch (error) {
    console.error("Error in comprehensive profile generation:", error)
    // Return basic default values if generation fails
   
  }
}


