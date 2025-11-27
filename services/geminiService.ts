import { GoogleGenAI } from "@google/genai";
import { SearchResult, SearchMode } from "../types";
import { extractJsonFromText, generateId } from "../utils";
import { GEMINI_MODEL } from "../constants";

const apiKey = process.env.API_KEY;

if (!apiKey) {
  console.error("API_KEY is missing from environment variables.");
}

const ai = new GoogleGenAI({ apiKey: apiKey || '' });

interface SearchOptions {
  query: string;
  minPrice?: string;
  maxPrice?: string;
  platforms?: string[];
  searchMode?: SearchMode;
  excludedProductNames?: string[]; // For pagination/load more
}

export const searchDeals = async ({
  query, 
  minPrice, 
  maxPrice, 
  platforms = [], 
  searchMode = 'fast',
  excludedProductNames = []
}: SearchOptions): Promise<SearchResult> => {
  try {
    // 1. Price Constraints
    let priceInstruction = "";
    if (minPrice || maxPrice) {
      priceInstruction = `\nSTRICT REQUIREMENT: Filter results to include ONLY items with a price between ${minPrice ? '$' + minPrice : '$0'} and ${maxPrice ? '$' + maxPrice : 'unlimited'}. Discard any products outside this range.`;
    }

    // 2. Platform Constraints
    let platformInstruction = "";
    if (platforms.length > 0) {
      platformInstruction = `\nSTRICT REQUIREMENT: Limit your search and results ONLY to products available from these specific retailers: ${platforms.join(", ")}. Do not include results from other stores.`;
    }

    // 3. Search Mode (Quantity)
    const countRequest = searchMode === 'extended' ? "8-12" : "3-5";

    // 4. Pagination / Exclusion (Load More)
    let exclusionInstruction = "";
    if (excludedProductNames.length > 0) {
      exclusionInstruction = `\nIMPORTANT: Do NOT include the following products that have already been listed: ${JSON.stringify(excludedProductNames.slice(0, 10))}. Find DIFFERENT deals.`;
    }

    // Construct Prompt
    const prompt = `
      You are an expert festive shopping assistant. 
      Search for real, currently available deals for the following query: "${query}".
      ${priceInstruction}
      ${platformInstruction}
      ${exclusionInstruction}
      
      Instructions:
      1. Use Google Search to find current prices and products.
      2. Identify ${countRequest} distinct, best-value products related to the query.
      3. For each product, extract: Name, Price, Store Name, specific Product URL (if found), a very brief description, and any expiration/urgency info (e.g., "Ends tomorrow", "Limited stock").
      4. IMPORTANT: Output a JSON array of these products at the very end of your response inside a \`\`\`json\`\`\` code block.
      
      The JSON structure for each item should be:
      {
        "id": "generate_unique_string",
        "name": "Product Name",
        "price": "$Price",
        "store": "Store Name",
        "description": "Short description (max 15 words)",
        "category": "General Category",
        "productUrl": "The direct URL to the product page if found in search results, otherwise null",
        "imageUrl": "The URL of the product image if explicitly found, otherwise null",
        "dealEnd": "Short expiration info like 'Ends Friday', '24h left', 'Limited time', or null if unknown"
      }

      Provide a helpful, festive summary text before the JSON block highlighting the best finding.
    `;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text || "";
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    // Parse the embedded JSON for the UI cards
    const parsedProducts = extractJsonFromText(text);

    // Map chunks to a cleaner format
    const sources = chunks
      .filter(chunk => chunk.web?.uri && chunk.web?.title)
      .map(chunk => ({
        web: {
          uri: chunk.web!.uri,
          title: chunk.web!.title
        }
      }));

    return {
      rawText: text.replace(/```json[\s\S]*```/, '').trim(), // Remove the JSON block from display text
      parsedProducts: parsedProducts.map(p => ({ ...p, id: p.id || generateId() })),
      sources
    };

  } catch (error) {
    console.error("Gemini Search Error:", error);
    throw error;
  }
};