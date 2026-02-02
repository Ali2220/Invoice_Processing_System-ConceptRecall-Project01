import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiService from '../services/api';
import './InvoiceDetailPage.css';

/**
 * Invoice Detail Page Component
 * Displays full invoice details including line items
 */
function InvoiceDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [invoice, setInvoice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    /**
     * Load invoice details on mount
     */
    useEffect(() => {
        loadInvoice();
    }, [id]);

    /**
     * Fetch invoice details
     */
    const loadInvoice = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await apiService.getInvoiceById(id);
            setInvoice(response.data);

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Format date
     */
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    /**
     * Format currency
     */
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    if (loading) {
        return (
            <div className="detail-page">
                <div className="detail-container">
                    <div className="loading-state">
                        <div className="spinner-large"></div>
                        <p>Loading invoice details...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="detail-page">
                <div className="detail-container">
                    <div className="error-state">
                        <p>✗ {error}</p>
                        <button onClick={() => navigate('/dashboard')} className="back-button">
                            ← Back to Dashboard
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!invoice) {
        return null;
    }

    return (
        <div className="detail-page">
            <div className="detail-container">
                <button onClick={() => navigate('/dashboard')} className="back-button">
                    ← Back to Dashboard
                </button>

                <div className="invoice-detail-card">
                    <div className="invoice-header">
                        <div>
                            <h1>Invoice #{invoice.invoiceNumber}</h1>
                            <p className="invoice-meta">Created: {formatDate(invoice.createdAt)}</p>
                        </div>
                        <div className="invoice-total-badge">
                            {formatCurrency(invoice.total)}
                        </div>
                    </div>

                    <div className="invoice-info-grid">
                        <div className="info-item">
                            <span className="info-label">Vendor</span>
                            <span className="info-value">{invoice.vendor}</span>
                        </div>

                        <div className="info-item">
                            <span className="info-label">Invoice Date</span>
                            <span className="info-value">{formatDate(invoice.date)}</span>
                        </div>

                        <div className="info-item">
                            <span className="info-label">Total Items</span>
                            <span className="info-value">{invoice.items.length}</span>
                        </div>
                    </div>

                    <div className="items-section">
                        <h2>📦 Line Items</h2>

                        <div className="items-table">
                            <div className="table-header">
                                <div className="col-name">Item Name</div>
                                <div className="col-qty">Quantity</div>
                                <div className="col-price">Unit Price</div>
                                <div className="col-total">Total</div>
                            </div>

                            {invoice.items.map((item, index) => (
                                <div key={index} className="table-row">
                                    <div className="col-name">{item.name}</div>
                                    <div className="col-qty">{item.quantity}</div>
                                    <div className="col-price">{formatCurrency(item.price)}</div>
                                    <div className="col-total">{formatCurrency(item.quantity * item.price)}</div>
                                </div>
                            ))}

                            <div className="table-footer">
                                <div className="footer-label">Grand Total</div>
                                <div className="footer-value">{formatCurrency(invoice.total)}</div>
                            </div>
                        </div>
                    </div>

                    {invoice.rawText && (
                        <details className="raw-text-section">
                            <summary>📄 View Raw Extracted Text</summary>
                            <pre className="raw-text">{invoice.rawText}</pre>
                        </details>
                    )}
                </div>
            </div>
        </div>
    );
}

export default InvoiceDetailPage;
