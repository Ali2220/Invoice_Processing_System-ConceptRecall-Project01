import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Gemini AI Service
 * Handles AI-powered invoice data extraction and structuring
 */
class GeminiService {
    constructor() {
        // Lazy initialization - will be set when first used
        this.genAI = null;
        this.model = null;
    }

    /**
     * Initialize Gemini AI (lazy initialization)
     */
    initialize() {
        if (this.genAI) {
            return; // Already initialized
        }

        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            throw new Error('GEMINI_API_KEY is not set in environment variables');
        }

        this.genAI = new GoogleGenerativeAI(apiKey);

        // Use the correct model name with full path
        // Available models verified: models/gemini-2.5-flash, models/gemini-2.5-pro, etc.
        this.model = this.genAI.getGenerativeModel({
            model: 'models/gemini-2.5-flash'  // Fast and efficient
        });

        console.log('✓ Gemini AI initialized successfully');
    }

    /**
     * Extract structured invoice data from raw text using Gemini AI
     * @param {string} rawText - Raw text extracted from PDF
     * @returns {Promise<Object>} Structured invoice data
     * @throws {Error} If AI processing fails or returns invalid data
     */
    async structureInvoiceData(rawText) {
        try {
            // Initialize Gemini AI if not already done
            this.initialize();

            // Create a detailed prompt for Gemini
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

            console.log('🤖 Sending request to Gemini AI...');

            // Generate content using Gemini
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            console.log('✓ Received response from Gemini AI');

            // Parse the JSON response
            const structuredData = this.parseGeminiResponse(text);

            // Validate the structured data
            this.validateInvoiceData(structuredData);

            return structuredData;
        } catch (error) {
            console.error('Gemini AI error:', error.message);

            if (error.message.includes('API key')) {
                throw new Error('Invalid Gemini API key. Please check your configuration.');
            } else if (error.message.includes('quota')) {
                throw new Error('Gemini API quota exceeded. Please try again later.');
            } else if (error.message.includes('validation')) {
                throw error;
            } else {
                throw new Error(`AI processing failed: ${error.message}`);
            }
        }
    }

    /**
     * Parse Gemini's response and extract JSON
     * @param {string} text - Raw response from Gemini
     * @returns {Object} Parsed JSON object
     */
    parseGeminiResponse(text) {
        try {
            // Remove markdown code blocks if present
            let cleanText = text.trim();

            // Remove ```json and ``` markers
            cleanText = cleanText.replace(/```json\s*/g, '');
            cleanText = cleanText.replace(/```\s*/g, '');

            // Find JSON object in the response
            const jsonMatch = cleanText.match(/\{[\s\S]*\}/);

            if (!jsonMatch) {
                throw new Error('No valid JSON found in AI response');
            }

            return JSON.parse(jsonMatch[0]);
        } catch (error) {
            console.error('Failed to parse Gemini response:', text);
            throw new Error(`Failed to parse AI response: ${error.message}`);
        }
    }

    /**
     * Validate structured invoice data
     * @param {Object} data - Invoice data to validate
     * @throws {Error} If validation fails
     */
    validateInvoiceData(data) {
        const errors = [];

        // Check required fields
        if (!data.invoiceNumber || typeof data.invoiceNumber !== 'string') {
            errors.push('Invalid or missing invoiceNumber');
        }

        if (!data.vendor || typeof data.vendor !== 'string') {
            errors.push('Invalid or missing vendor');
        }

        if (!data.date) {
            errors.push('Missing date');
        }

        if (typeof data.total !== 'number' || data.total < 0) {
            errors.push('Invalid total amount');
        }

        if (!Array.isArray(data.items) || data.items.length === 0) {
            errors.push('Invalid or empty items array');
        } else {
            // Validate each item
            data.items.forEach((item, index) => {
                if (!item.name || typeof item.name !== 'string') {
                    errors.push(`Item ${index + 1}: Invalid or missing name`);
                }
                if (typeof item.quantity !== 'number' || item.quantity < 0) {
                    errors.push(`Item ${index + 1}: Invalid quantity`);
                }
                if (typeof item.price !== 'number' || item.price < 0) {
                    errors.push(`Item ${index + 1}: Invalid price`);
                }
            });
        }

        if (errors.length > 0) {
            throw new Error(`Invoice data validation failed: ${errors.join(', ')}`);
        }

        console.log('✓ Invoice data validation passed');
    }
}

export default new GeminiService();
