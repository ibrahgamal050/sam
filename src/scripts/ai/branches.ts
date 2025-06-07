import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { validateBranch } from './branch-validator.js'; // افترضت أن فيها Types
import { IBranch } from '@/types'; // استيراد IBranch

// تحميل المتغيرات البيئية
dotenv.config();

interface OldBranch {
  name: string;
  address: string;
}

// Get directory name
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// تعريف ناتج الدالة validateBranch
interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

async function generateBranchData(restaurantName: string, oldBranches: OldBranch[]): Promise<IBranch[]> {
  try {
    console.log(`Generating improved branches for ${restaurantName} using Perplexity API...`);
    
    // بناء النص لتمريره للـ API بناءً على العناوين القديمة
    const prompt = `
Improve and generate realistic branch locations for a restaurant chain called "${restaurantName}" in Egypt based on the following old branches:

${oldBranches.map(branch => `- Name: ${branch.name}, Address: ${branch.address}`).join('\n')}

For each branch, provide the following information in JSON format:

{
  "name": {
    "ar": "[Arabic name of the branch location]",
    "en": "[English name of the branch location]"
  },
  "location": {
    "address": {
      "ar": "[Detailed address in Arabic]",
      "en": "[Detailed address in English]"
    },
    "latitude": [latitude coordinate],
    "longitude": [longitude coordinate]
  },
  "phone": "[Egyptian format phone number]",
  "workingHours": "[Working hours, e.g., '9 AM - 12 AM']",
  "isMainBranch": [true/false, only one branch should be true]
}

Make sure:
1. All branches have realistic Egyptian addresses in both Arabic and English.
2. Only one branch is marked as the main branch.
3. All coordinates are accurate for the given addresses.
4. Phone numbers follow Egyptian format.
5. Working hours are realistic for restaurants in Egypt.

Return the data as a valid JSON array with branch objects.
`;

    const options = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "sonar-pro",
        messages: [
          {
            role: "system",
            content: "You are a professional data generator specializing in location data. Always return valid JSON."
          },
          {
            role: "user",
            content: prompt
          }
        ]
      })
    };

    console.log("Sending request to Perplexity API...");
    const response = await fetch('https://api.perplexity.ai/chat/completions', options);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed with status ${response.status}: ${errorText}`);
    }

    const data = await response.json() as {
      choices: Array<{
        message: {
          content: string;
        }
      }>
    };

    console.log("Received response from Perplexity API");

    // Extract the generated text
    const text = data.choices[0].message.content;

    // Parse the JSON response
    let branches: IBranch[];
    try {
      // Find JSON array in the response
      const jsonMatch = text.match(/\[\s*\{[\s\S]*\}\s*\]/);
      if (jsonMatch) {
        branches = JSON.parse(jsonMatch[0]);
      } else {
        // Try parsing the entire response as JSON
        branches = JSON.parse(text);
      }
    } catch (error) {
      console.error("Error parsing JSON response:", error);
      console.log("Raw response:", text);
      throw new Error("Failed to parse branch data from Perplexity response");
    }

    // Validate each branch
    const validationResults = branches.map(branch => ({
      branch,
      validation: validateBranch(branch) as ValidationResult
    }));

    // Log validation results
    const invalidBranches = validationResults.filter(r => !r.validation.isValid);
    if (invalidBranches.length > 0) {
      console.warn(`Warning: ${invalidBranches.length} branches have validation errors:`);
      invalidBranches.forEach(r => {
        console.warn(`- Branch "${r.branch.name?.en || 'Unknown'}": ${r.validation.errors.join(', ')}`);
      });
    } else {
      console.log("All branches passed validation!");
    }

    // Save to file
    const outputDir = path.join(process.cwd(), 'output');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = path.join(outputDir, 'generated-branches.json');
    fs.writeFileSync(outputPath, JSON.stringify(branches, null, 2));
    console.log(`Generated branch data saved to ${outputPath}`);

    return branches;
  } catch (error) {
    console.error("Error generating branch data:", error);
    throw error;
  }
}

export default generateBranchData;
