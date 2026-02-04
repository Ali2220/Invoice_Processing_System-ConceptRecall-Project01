import express from "express";
import invoiceController from "../controllers/invoiceController.js";
import upload, { handleMulterError } from "../utils/upload.js";
import authMiddleware from "../middlewares/authMiddleware.js";
const router = express.Router();

// Upload invoice PDF
// POST /api/invoice/upload
router.post(
  "/upload",
  authMiddleware,
  upload.single("invoice"),
  handleMulterError,
  invoiceController.uploadInvoice,
);

// Get all invoices
// GET /api/invoice
router.get("/", authMiddleware, invoiceController.getAllInvoices);

// Export invoices as CSV
// GET /api/invoice/export
router.get("/export", authMiddleware, invoiceController.exportInvoices);

// Get invoice by ID (must be after /export to avoid route conflict)
// GET /api/invoice/:id
router.get("/:id", authMiddleware, invoiceController.getInvoiceById);

export default router;
