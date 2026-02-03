// geminiService.js
// Yeh file Gemini AI se invoice data extract karne ka kaam karti hai
// NEW SDK: @google/genai (updated version)

import { GoogleGenAI } from "@google/genai";

// Yeh variables sirf isi file mein use honge
let ai = null;

/**
 * Initialize Gemini AI
 * Yeh function tab call hota hai jab pehli baar AI ki zaroorat hoti hai
 */
function initializeGemini() {
  // Agar already initialized hai toh dobara mat karo
  if (ai !== null) {
    return;
  }

  // Environment variable se API key lo
  const apiKey = process.env.GEMINI_API_KEY;

  // Check karo ke API key set hai ya nahi
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set in environment variables");
  }

  // NAYA SDK: GoogleGenAI ka object banao
  ai = new GoogleGenAI({ apiKey: apiKey });

  console.log("Gemini AI initialized successfully with @google/genai");
}

/**
 * Extract structured invoice data from raw text using Gemini AI
 * @param {string} rawText - Raw text extracted from PDF
 * @returns {Promise<Object>} Structured invoice data
 */
async function structureInvoiceData(rawText) {
  try {
    // Pehle check karo ke AI initialized hai ya nahi
    initializeGemini();

    // Gemini ko prompt bhejo ke kya karna hai
    const prompt = `
You are an expert invoice data extraction system. Analyze the following invoice text and extract structured data.

INVOICE TEXT:
${rawText}

INSTRUCTIONS:
1. Extract the invoice number, vendor name, date, and total amount
2. Extract all line items with their name, quantity, and price
3. Return ONLY valid JSON with no additional text or markdown
4. Use the exact format shown below
5. If a field is not found, use reasonable defaults (e.g., "Unknown" for vendor, current date for date)
6. Ensure all numbers are valid (no currency symbols)
7. Date should be in ISO format (YYYY-MM-DD)

REQUIRED JSON FORMAT:
{
  "invoiceNumber": "string",
  "vendor": "string",
  "date": "YYYY-MM-DD",
  "total": number,
  "items": [
    {
      "name": "string",
      "quantity": number,
      "price": number
    }
  ]
}

Return only the JSON object, nothing else.
`;

    console.log("Sending request to Gemini AI...");

    // NAYA SDK: ai.models.generateContent use karo
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", // Model name same rahega
      contents: prompt, // 'contents' mein prompt do
    });

    // NAYA SDK: Direct response.text property
    const text = response.text;
    console.log("Received response from Gemini AI");

    // Response mein se JSON nikalo
    const structuredData = parseGeminiResponse(text);

    // Check karo ke data sahi hai ya nahi
    validateInvoiceData(structuredData);

    return structuredData;
  } catch (error) {
    console.error("Gemini AI error:", error.message);

    // Alag alag errors ke liye alag messages
    if (error.message.includes("API key")) {
      throw new Error(
        "Invalid Gemini API key. Please check your configuration.",
      );
    } else if (error.message.includes("quota")) {
      throw new Error("Gemini API quota exceeded. Please try again later.");
    } else if (error.message.includes("validation")) {
      throw error;
    } else {
      throw new Error(`AI processing failed: ${error.message}`);
    }
  }
}

/*  MY Code 😀 */
// async function structureInvoiceData(rawText) {
//   try {
//     initializeGemini();

//     const prompt = `
//             You are an expert invoice data extraction system. Analyze the following invoice text and extract structured data.

// INVOICE TEXT:
// ${rawText}

// INSTRUCTIONS:
// 1. Extract the invoice number, vendor name, date, and total amount
// 2. Extract all line items with their name, quantity, and price
// 3. Return ONLY valid JSON with no additional text or markdown
// 4. Use the exact format shown below
// 5. If a field is not found, use reasonable defaults (e.g., "Unknown" for vendor, current date for date)
// 6. Ensure all numbers are valid (no currency symbols)
// 7. Date should be in ISO format (YYYY-MM-DD)

// REQUIRED JSON FORMAT:
// {
//   "invoiceNumber": "string",
//   "vendor": "string",
//   "date": "YYYY-MM-DD",
//   "total": number,
//   "items": [
//     {
//       "name": "string",
//       "quantity": number,
//       "price": number
//     }
//   ]
// }

// Return only the JSON object, nothing else.
// `;

//     const response = await ai.models.generateContent({
//       model: "gemini-3-flash-preview",
//       content: prompt,
//     });

//     const text = response.text;
//     const structuredData = parseGeminiResponse(text);
//     console.log(structuredData);
//   } catch (err) {}
// }

/**
 * Read Gemini's response and extract JSON
 * @param {string} text - Raw response from Gemini
 * @returns {Object} Parsed JSON object
 */

function parseGeminiResponse(text) {
  try {
    // Pehle extra spaces hatao
    let cleanText = text.trim();

    // Agar response mein markdown code block hai toh hatao
    cleanText = cleanText.replace(/```json/g, "");
    cleanText = cleanText.replace(/```/g, "");

    // JSON object dhoondo curly braces se
    const startIndex = cleanText.indexOf("{");
    const endIndex = cleanText.lastIndexOf("}");

    // Agar curly braces nahi mile toh error do
    if (startIndex === -1 || endIndex === -1) {
      throw new Error("No valid JSON found in AI response");
    }

    // JSON part nikalo
    const jsonString = cleanText.substring(startIndex, endIndex + 1);

    // String ko JSON object mein convert karo
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Failed to parse Gemini response:", text);
    throw new Error(`Failed to parse AI response: ${error.message}`);
  }
}

/**
 * Validate structured invoice data
 * @param {Object} data - Invoice data to validate
 */
function validateInvoiceData(data) {
  const errors = [];

  // Check invoice number
  if (!data.invoiceNumber) {
    errors.push("Missing invoiceNumber");
  } else if (typeof data.invoiceNumber !== "string") {
    errors.push("Invalid invoiceNumber (should be string)");
  }

  // Check vendor
  if (!data.vendor) {
    errors.push("Missing vendor");
  } else if (typeof data.vendor !== "string") {
    errors.push("Invalid vendor (should be string)");
  }

  // Check date
  if (!data.date) {
    errors.push("Missing date");
  }

  // Check total
  if (typeof data.total !== "number") {
    errors.push("Invalid total (should be number)");
  } else if (data.total < 0) {
    errors.push("Total cannot be negative");
  }

  // Check items array
  if (!data.items) {
    errors.push("Missing items");
  } else if (!Array.isArray(data.items)) {
    errors.push("Invalid items (should be array)");
  } else if (data.items.length === 0) {
    errors.push("Items array is empty");
  } else {
    // Har item check karo
    for (let i = 0; i < data.items.length; i++) {
      const item = data.items[i];

      // Check item name
      if (!item.name) {
        errors.push(`Item ${i + 1}: Missing name`);
      } else if (typeof item.name !== "string") {
        errors.push(`Item ${i + 1}: Invalid name (should be string)`);
      }

      // Check quantity
      if (typeof item.quantity !== "number") {
        errors.push(`Item ${i + 1}: Invalid quantity (should be number)`);
      } else if (item.quantity < 0) {
        errors.push(`Item ${i + 1}: Quantity cannot be negative`);
      }

      // Check price
      if (typeof item.price !== "number") {
        errors.push(`Item ${i + 1}: Invalid price (should be number)`);
      } else if (item.price < 0) {
        errors.push(`Item ${i + 1}: Price cannot be negative`);
      }
    }
  }

  // Agar koi error hai toh throw karo
  if (errors.length > 0) {
    throw new Error(`Invoice data validation failed: ${errors.join(", ")}`);
  }

  console.log("Invoice data validation passed");
}

// Export all functions as an object
export default {
  structureInvoiceData,
};
