import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const InvoiceDetailPage = () => {
    const { id } = useParams(); // URL se ID nikalne ke liye (e.g. /invoice/123)
    const [invoice, setInvoice] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const getDetails = async () => {
            try {
                // Sirf is ID wali invoice ka data mangwaya
                const response = await axios.get(`/api/invoice/${id}`, { withCredentials: true });
                setInvoice(response.data.data);
            } catch (err) {
                alert("Detail load nahi ho saki!");
            } finally {
                setLoading(false);
            }
        };
        getDetails();
    }, [id]);

    if (loading) return <h2>Loading details...</h2>;
    if (!invoice) return <h2>Invoice nahi mili!</h2>;

    return (
        <div style={{ padding: '20px' }}>
            <button onClick={() => navigate('/dashboard')}> ← Wapas Dashboard jayein</button>

            <div style={{ marginTop: '20px', padding: '20px', border: '2px solid #007bff', borderRadius: '10px' }}>
                <h1>Invoice Detail: #{invoice.invoiceNumber}</h1>
                <hr />
                <p><b>Vendor Name:</b> {invoice.vendor}</p>
                <p><b>Date:</b> {new Date(invoice.date).toLocaleDateString()}</p>

                <h3>Items (Saman ki list):</h3>
                <ul>
                    {invoice.items.map((item, index) => (
                        <li key={index}>
                            {item.name} - {item.quantity} x ${item.price} = <b>${item.quantity * item.price}</b>
                        </li>
                    ))}
                </ul>

                <h2 style={{ color: 'blue' }}>Grand Total: ${invoice.total}</h2>
            </div>
        </div>
    );
};

export default InvoiceDetailPage;
