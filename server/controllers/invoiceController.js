// invoiceController.js
// Yeh file invoice se related saare operations handle karti hai

import Invoice from "../models/Invoice.js";
import pdfService from "../services/pdfService.js";
import geminiService from "../services/geminiService.js";
import { Parser } from "json2csv";

/**
 * Upload and process invoice PDF
 * POST /api/invoice/upload
 */
async function uploadInvoice(req, res) {
  let filePath = null;

  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "No file uploaded. Please upload a PDF file.",
      });
    }

    filePath = req.file.path;

    console.log(filePath);
    console.log(`Processing invoice: ${req.file.originalname}`);

    // Step 1: Extract text from PDF
    const rawText = await pdfService.extractText(filePath);

    // Step 2: Structure data using Gemini AI
    const structuredData = await geminiService.structureInvoiceData(rawText);

    // Step 3: Save to MongoDB
    const invoice = new Invoice({
      invoiceNumber: structuredData.invoiceNumber,
      vendor: structuredData.vendor,
      date: structuredData.date,
      total: structuredData.total,
      items: structuredData.items,
      rawText: rawText,
    });

    await invoice.save();

    console.log(`Invoice saved to database: ${invoice.invoiceNumber}`);

    // Clean up uploaded file
    await pdfService.deleteFile(filePath);

    // Return success response
    res.status(201).json({
      success: true,
      message: "Invoice processed successfully",
      data: invoice,
    });
  } catch (error) {
    console.error("Upload error:", error.message);

    // Clean up file if it exists
    if (filePath) {
      await pdfService.deleteFile(filePath);
    }

    // Return error response
    res.status(500).json({
      success: false,
      error: error.message || "Failed to process invoice",
    });
  }
}

/**
 * Get all invoices
 * GET /api/invoice
 */
async function getAllInvoices(req, res) {
  try {
    // Fetch all invoices, sorted by creation date (newest first)
    const invoices = await Invoice.find()
      .select("-rawText") // rawText ko hta dia, takay response acha ho.
      .sort({ createdAt: -1 }); // descending order mein sort karo, takay new invoices pehle aayein

    console.log("All Invoices: ", invoices);

    res.status(200).json({
      success: true,
      count: invoices.length,
      data: invoices,
    });
  } catch (error) {
    console.error("Fetch invoices error:", error.message);

    res.status(500).json({
      success: false,
      error: "Failed to fetch invoices",
    });
  }
}

/**
 * Get invoice by ID with full details
 * GET /api/invoice/:id
 */
async function getInvoiceById(req, res) {
  try {
    const id = req.params.id;

    // Fetch invoice with all details including items
    const invoice = await Invoice.findById(id);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        error: "Invoice not found",
      });
    }

    res.status(200).json({
      success: true,
      data: invoice,
    });
  } catch (error) {
    console.error("Fetch invoice error:", error.message);

    res.status(500).json({
      success: false,
      error: "Failed to fetch invoice details",
    });
  }
}

/**
 * Export all invoices as CSV
 * GET /api/invoice/export
 */
async function exportInvoices(req, res) {
  try {
    // 1. Get all invoices
    const invoices = await Invoice.find();

    if (!invoices.length) {
      return res.status(404).json({
        success: false,
        error: "No invoices found",
      });
    }

    // 2. Convert invoices into simple objects
    const data = invoices.map((inv) => ({
      invoiceNumber: inv.invoiceNumber,
      vendor: inv.vendor,
      date: inv.date.toISOString().split("T")[0],
      total: inv.total,
      itemCount: inv.items.length,
    }));

    // 3. Create CSV
    const parser = new Parser();
    const csv = parser.parse(data);
    console.log("CSV wala data", csv);

    // 4. Send CSV file / Download
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=invoices.csv");

    res.send(csv);
  } catch (err) {
    res.status(500).json({
      success: false,
      error: "Something went wrong",
    });
  }
}

// Export all functions as an object
export default {
  uploadInvoice,
  getAllInvoices,
  getInvoiceById,
  exportInvoices,
};
