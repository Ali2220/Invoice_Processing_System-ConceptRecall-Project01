import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const DashboardPage = () => {
    const [invoices, setInvoices] = useState([]); // Invoices ki list yahan save hogi
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // useEffect ka matlab: "Jab ye page load ho, toh foran ye kaam karo"
    useEffect(() => {
        fetchInvoices();
    }, []);

    const fetchInvoices = async () => {
        try {
            // Backend se saari invoices mangwayi
            const response = await axios.get('/api/invoice', { withCredentials: true });
            setInvoices(response.data.data || []); // Data state mein save kar liya
        } catch (err) {
            console.error("Invoices load nahi ho sakein", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <h2>Loading... Intezar karein...</h2>;

    return (
        <div style={{ padding: '20px' }}>
            <h1>📊 My Invoices</h1>

            {invoices.length === 0 ? (
                <p>Abhi koi invoice nahi hai. Pehle upload karein!</p>
            ) : (
                <div style={{ display: 'grid', gap: '15px' }}>
                    {invoices.map((inv) => (
                        <div
                            key={inv._id}
                            style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px', cursor: 'pointer', backgroundColor: '#f9f9f9' }}
                            onClick={() => navigate(`/invoice/${inv._id}`)} // Click karne par detail page par jaye ga
                        >
                            <h3 style={{ margin: 0 }}>Invoice #{inv.invoiceNumber}</h3>
                            <p>Vendor: <b>{inv.vendor}</b></p>
                            <p>Total: <b style={{ color: 'green' }}>${inv.total}</b></p>
                            <small>Click karein details dekhne ke liye</small>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DashboardPage;
