// pdfService.js
// Yeh file PDF files se text extract karne ka kaam karti hai

import fs from "fs/promises";
import pdfParse from "pdf-parse";

// Pdf file ka content extract kro
async function extractText(filePath) {
  try {
    // PDF file ko buffer ki tarah read karo
    const dataBuffer = await fs.readFile(filePath);

    // pdf-parse library use karke text nikalo
    const pdfData = await pdfParse(dataBuffer);

    // Text ko trim karo (extra spaces hatao)
    const text = pdfData.text.trim();

    // Check karo ke text empty toh nahi hai
    if (!text) {
      throw new Error("PDF appears to be empty or contains no readable text");
    }

    // Check karo ke text ki length 0 toh nahi hai
    if (text.length === 0) {
      throw new Error("PDF appears to be empty or contains no readable text");
    }

    console.log(`Successfully extracted ${text.length} characters from PDF`);

    return text;
  } catch (error) {
    console.error("PDF parsing error:", error.message);
    throw new Error(error.message);
  }
}

// jo pdf file upload hogi upload folder mai, usse delete kr denge takay storage na bhare.
async function deleteFile(filePath) {
  try {
    const deletedFile = await fs.unlink(filePath);
    console.log("File Deleted");
  } catch (err) {
    throw new Error(err.message);
  }
}

// Export all functions as an object
export default {
  extractText,
  deleteFile,
};
