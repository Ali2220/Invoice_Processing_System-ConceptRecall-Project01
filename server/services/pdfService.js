import fs from 'fs/promises';
import pdfParse from 'pdf-parse';

/**
 * PDF Service
 * Handles PDF file parsing and text extraction
 */
class PDFService {
    /**
     * Extract text content from a PDF file
     * @param {string} filePath - Path to the PDF file
     * @returns {Promise<string>} Extracted text content
     * @throws {Error} If PDF is empty, unreadable, or parsing fails
     */
    async extractText(filePath) {
        try {
            // Read the PDF file as a buffer
            const dataBuffer = await fs.readFile(filePath);

            // Parse the PDF
            const pdfData = await pdfParse(dataBuffer);

            // Extract text content
            const text = pdfData.text.trim();

            // Validate that we got some text
            if (!text || text.length === 0) {
                throw new Error('PDF appears to be empty or contains no readable text');
            }

            console.log(`✓ Successfully extracted ${text.length} characters from PDF`);

            return text;
        } catch (error) {
            console.error('PDF parsing error:', error.message);

            // Provide specific error messages
            if (error.message.includes('Invalid PDF')) {
                throw new Error('Invalid or corrupted PDF file');
            } else if (error.message.includes('empty')) {
                throw error;
            } else {
                throw new Error(`Failed to parse PDF: ${error.message}`);
            }
        }
    }

    /**
     * Clean up uploaded file
     * @param {string} filePath - Path to the file to delete
     */
    async deleteFile(filePath) {
        try {
            await fs.unlink(filePath);
            console.log(`✓ Cleaned up temporary file: ${filePath}`);
        } catch (error) {
            console.error(`Warning: Could not delete file ${filePath}:`, error.message);
        }
    }
}

export default new PDFService();
