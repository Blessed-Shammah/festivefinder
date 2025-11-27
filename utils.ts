import { DealProduct } from './types';

/**
 * Attempts to parse a JSON array from a markdown-formatted string.
 * Gemini often returns JSON inside ```json ... ``` blocks.
 */
export const extractJsonFromText = (text: string): DealProduct[] => {
  try {
    let jsonString = '';

    // 1. Try to find JSON within code blocks
    const jsonBlockMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonBlockMatch && jsonBlockMatch[1]) {
      jsonString = jsonBlockMatch[1];
    } else {
      // 2. Try to find a raw array structure if no code blocks
      const arrayMatch = text.match(/\[\s*\{[\s\S]*\}\s*\]/);
      if (arrayMatch) {
        jsonString = arrayMatch[0];
      }
    }

    if (jsonString) {
      // Basic cleanup for potential trailing commas which valid JSON prohibits but LLMs sometimes add
      jsonString = jsonString.replace(/,\s*]/g, ']'); 
      jsonString = jsonString.replace(/,\s*}/g, '}');
      
      return JSON.parse(jsonString);
    }

    return [];
  } catch (e) {
    console.warn("Failed to parse structured data from Gemini response", e);
    return [];
  }
};

export const generateId = () => Math.random().toString(36).substr(2, 9);
