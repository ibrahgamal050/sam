/**
 * Helper function to clean API responses before parsing JSON
 * Removes markdown formatting and ensures valid JSON structure
 */
export function cleanJsonResponse(text: string) {
    // Remove markdown code block indicators
    let cleaned = text.replace(/```(json|javascript|js)?\s*/g, "").replace(/```\s*$/g, "")
  
    // Try to extract JSON object if there's text before or after it
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      cleaned = jsonMatch[0]
    }
  
    // Remove any trailing commas in arrays or objects which are invalid in JSON
    cleaned = cleaned.replace(/,(\s*[\]}])/g, "$1")
  
    return cleaned
  }
  