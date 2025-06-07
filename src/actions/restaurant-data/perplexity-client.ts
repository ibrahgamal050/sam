import { createPerplexity } from "@ai-sdk/perplexity"

/**
 * Create a properly configured Perplexity client
 */
export const perplexityClient = createPerplexity({
  apiKey: process.env.PERPLEXITY_API_KEY || "",
})
