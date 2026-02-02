import express from 'express';
import invoiceController from '../controllers/invoiceController.js';
import upload, { handleMulterError } from '../utils/upload.js';

const router = express.Router();

/**
 * Invoice Routes
 */

// Upload invoice PDF
// POST /api/invoice/upload
router.post(
    '/upload',
    upload.single('invoice'),
    handleMulterError,
    invoiceController.uploadInvoice
);

// Get all invoices
// GET /api/invoice
router.get('/', invoiceController.getAllInvoices);

// Export invoices as CSV
// GET /api/invoice/export
router.get('/export', invoiceController.exportInvoices);

// Get invoice by ID (must be after /export to avoid route conflict)
// GET /api/invoice/:id
router.get('/:id', invoiceController.getInvoiceById);

export default router;
