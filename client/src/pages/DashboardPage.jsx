import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/api';
import './DashboardPage.css';

/**
 * Dashboard Page Component
 * Displays all invoices with export functionality
 */
function DashboardPage() {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [exporting, setExporting] = useState(false);
    const navigate = useNavigate();

    /**
     * Load invoices on component mount
     */
    useEffect(() => {
        loadInvoices();
    }, []);

    /**
     * Fetch all invoices from API
     */
    const loadInvoices = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await apiService.getAllInvoices();
            setInvoices(response.data);

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Export invoices to CSV
     */
    const handleExport = async () => {
        try {
            setExporting(true);
            await apiService.exportInvoices();
        } catch (err) {
            alert(`Export failed: ${err.message}`);
        } finally {
            setExporting(false);
        }
    };

    /**
     * Navigate to invoice detail page
     */
    const viewInvoice = (id) => {
        navigate(`/invoice/${id}`);
    };

    /**
     * Format date for display
     */
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
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

    return (
        <div className="dashboard-page">
            <div className="dashboard-container">
                <div className="dashboard-header">
                    <div>
                        <h1>📊 Invoice Dashboard</h1>
                        <p className="subtitle">View and manage all processed invoices</p>
                    </div>

                    <div className="header-actions">
                        <button
                            onClick={handleExport}
                            disabled={invoices.length === 0 || exporting}
                            className="export-button"
                        >
                            {exporting ? 'Exporting...' : '📥 Export CSV'}
                        </button>
                    </div>
                </div>

                {loading && (
                    <div className="loading-state">
                        <div className="spinner-large"></div>
                        <p>Loading invoices...</p>
                    </div>
                )}

                {error && (
                    <div className="error-state">
                        <p>✗ {error}</p>
                        <button onClick={loadInvoices} className="retry-button">
                            Retry
                        </button>
                    </div>
                )}

                {!loading && !error && invoices.length === 0 && (
                    <div className="empty-state">
                        <svg className="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <h2>No invoices yet</h2>
                        <p>Upload your first invoice to get started</p>
                        <button onClick={() => navigate('/')} className="upload-link-button">
                            Upload Invoice
                        </button>
                    </div>
                )}

                {!loading && !error && invoices.length > 0 && (
                    <>
                        <div className="stats-bar">
                            <div className="stat-card">
                                <div className="stat-value">{invoices.length}</div>
                                <div className="stat-label">Total Invoices</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-value">
                                    {formatCurrency(invoices.reduce((sum, inv) => sum + inv.total, 0))}
                                </div>
                                <div className="stat-label">Total Amount</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-value">
                                    {invoices.reduce((sum, inv) => sum + inv.items.length, 0)}
                                </div>
                                <div className="stat-label">Total Items</div>
                            </div>
                        </div>

                        <div className="invoice-grid">
                            {invoices.map((invoice) => (
                                <div
                                    key={invoice._id}
                                    className="invoice-card"
                                    onClick={() => viewInvoice(invoice._id)}
                                >
                                    <div className="invoice-card-header">
                                        <h3>#{invoice.invoiceNumber}</h3>
                                        <span className="invoice-date">{formatDate(invoice.date)}</span>
                                    </div>

                                    <div className="invoice-card-body">
                                        <div className="invoice-vendor">
                                            <span className="label">Vendor:</span>
                                            <span className="value">{invoice.vendor}</span>
                                        </div>

                                        <div className="invoice-total">
                                            <span className="label">Total:</span>
                                            <span className="value total-amount">{formatCurrency(invoice.total)}</span>
                                        </div>

                                        <div className="invoice-items">
                                            <span className="label">Items:</span>
                                            <span className="value">{invoice.items.length}</span>
                                        </div>
                                    </div>

                                    <div className="invoice-card-footer">
                                        <span className="view-details">View Details →</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default DashboardPage;
