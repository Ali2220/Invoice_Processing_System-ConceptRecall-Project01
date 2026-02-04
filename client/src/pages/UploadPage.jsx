import { useState } from 'react';
import axios from 'axios';
import './UploadPage.css';

const UploadPage = () => {
  // 1. Files aur messages ko yaad rakhne ke liye 'State'
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState(''); // Success message ke liye
  const [loading, setLoading] = useState(false); // Button disable karne ke liye

  // 2. Jab user file select kare
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // 3. Jab "Upload" button dabaya jaye
  const handleUpload = async () => {
    if (!file) {
      alert("Pehle koi PDF file select karein!");
      return;
    }

    setLoading(true);
    setStatus('Processing... Intezar karein...');

    // FormData: Jab humein file bhejni hoti hai, toh hum iska use karte hain
    const formData = new FormData();
    formData.append('invoice', file); // 'invoice' wahi naam hai jo backend dhoond raha hai

    try {
      const response = await axios.post('/api/invoice/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true // Cookies (Token) saath bhejne ke liye
      });

      if (response.data.success) {
        setStatus('✓ Mubarak ho! Invoice process ho gayi.');
        setFile(null); // File reset kar di
      }
    } catch (err) {
      setStatus('✗ Masla aa gaya: ' + (err.response?.data?.message || 'Upload failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>📥 Invoice Upload karein</h1>
      <p>PDF file select karein aur AI us mein se data nikal lega.</p>

      <div style={{ margin: '30px 0', border: '2px dashed #ccc', padding: '20px' }}>
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
        />
      </div>

      {file && <p>Selected: <b>{file.name}</b></p>}

      <button
        onClick={handleUpload}
        disabled={loading}
        style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', cursor: 'pointer' }}
      >
        {loading ? 'Processing...' : 'Upload & Process'}
      </button>

      {status && <p style={{ marginTop: '20px', fontWeight: 'bold' }}>{status}</p>}
    </div>
  );
};

export default UploadPage;
