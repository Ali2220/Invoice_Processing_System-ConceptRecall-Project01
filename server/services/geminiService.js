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
    console.log("Received response from Gemini AI:", text);

    // Response mein se JSON nikalo
    const structuredData = parseGeminiResponse(text);

    // Check karo ke data mojod hai or sahi hai ya nahi
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

/**
 * Read Gemini's response and extract JSON
 * @param {string} text - Raw response from Gemini
 * @returns {Object} Parsed JSON object
 */

function parseGeminiResponse(text) {
  try {
    // Pehle extra spaces hatao
    let cleanText = text.trim();
    // ```json (markdown start tag) hatao
    // ``` (markdown end tag) hatao
    // ai response mein kabhi kabhi markdown tags aa jate hain, unko remove kra hai Ali tumne
    cleanText = cleanText.replace(/```json/g, "");
    cleanText = cleanText.replace(/```/g, "");

    // hum curly braces is liye dhond rhe hain kyunki valid JSON wahi hota hai jo curly braces ke andar hota hai
    const startIndex = cleanText.indexOf("{");
    const endIndex = cleanText.lastIndexOf("}");

    // Agar curly braces nahi mile toh error do
    if (startIndex === -1 || endIndex === -1) {
      throw new Error("No valid JSON found in AI response");
    }

    // JSON part nikalo. For example: {Hello this is ai generated}
    const jsonString = cleanText.substring(startIndex, endIndex + 1);

    // String ko JSON object mein convert karo
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Failed to parse Gemini response:", text);
    throw new Error(`Failed to parse AI response: ${error.message}`);
  }
}

/**
 * ValidateInvoiceData function mai wo data jae ga jo parseGemniResponse se filter ho kr aya hai. For example: {"invoiceNumber": "001", ...}
 * @param {Object} data - Invoice data to validate
 */
function validateInvoiceData(data) {
  // Basic object check
  if (!data || typeof data !== "object") {
    throw new Error("Invalid invoice data");
  }

  // Required top-level fields
  if (!data.invoiceNumber || !data.vendor || !data.date) {
    throw new Error("Missing required invoice fields");
  }

  // Total must be a positive number
  if (typeof data.total !== "number" || data.total < 0) {
    throw new Error("Invalid total amount");
  }

  // Items must be a non-empty array
  if (!Array.isArray(data.items) || data.items.length === 0) {
    throw new Error("Invoice items are missing");
  }

  // Simple check for each item
  for (let i = 0; i < data.items.length; i++) {
    const item = data.items[i];

    if (
      !item.name ||
      typeof item.quantity !== "number" ||
      typeof item.price !== "number"
    ) {
      throw new Error(`Invalid item at position ${i + 1}`);
    }
  }

  console.log("Invoice data validation passed");
}

// Export all functions as an object
export default {
  structureInvoiceData,
};
