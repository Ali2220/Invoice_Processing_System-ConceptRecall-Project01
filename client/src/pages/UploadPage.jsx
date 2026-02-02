import { useState } from 'react';
import apiService from '../services/api';
import './UploadPage.css';

/**
 * Upload Page Component
 * Allows users to upload invoice PDFs
 */
function UploadPage() {
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);

    /**
     * Handle file selection
     */
    const handleFileChange = (e) => {
        const file = e.target.files[0];

        if (file) {
            // Validate file type
            if (file.type !== 'application/pdf') {
                setError('Please select a PDF file');
                setSelectedFile(null);
                return;
            }

            // Validate file size (10MB)
            if (file.size > 10 * 1024 * 1024) {
                setError('File size must be less than 10MB');
                setSelectedFile(null);
                return;
            }

            setSelectedFile(file);
            setError(null);
            setMessage(null);
        }
    };

    /**
     * Handle file upload
     */
    const handleUpload = async () => {
        if (!selectedFile) {
            setError('Please select a file first');
            return;
        }

        setUploading(true);
        setError(null);
        setMessage(null);

        try {
            const response = await apiService.uploadInvoice(selectedFile);

            setMessage(`✓ Invoice processed successfully! Invoice #${response.data.invoiceNumber}`);
            setSelectedFile(null);

            // Reset file input
            document.getElementById('file-input').value = '';

        } catch (err) {
            setError(err.message);
        } finally {
            setUploading(false);
        }
    };

    /**
     * Handle drag and drop
     */
    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();

        const file = e.dataTransfer.files[0];
        if (file) {
            handleFileChange({ target: { files: [file] } });
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    return (
        <div className="upload-page">
            <div className="upload-container">
                <h1>📄 Upload Invoice</h1>
                <p className="subtitle">Upload a PDF invoice to extract and store data automatically</p>

                <div
                    className="drop-zone"
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                >
                    <div className="drop-zone-content">
                        <svg className="upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>

                        <p className="drop-text">Drag and drop your PDF here</p>
                        <p className="drop-text-or">or</p>

                        <label htmlFor="file-input" className="file-label">
                            Choose File
                        </label>
                        <input
                            id="file-input"
                            type="file"
                            accept=".pdf,application/pdf"
                            onChange={handleFileChange}
                            className="file-input"
                        />
                    </div>
                </div>

                {selectedFile && (
                    <div className="file-info">
                        <p>📎 Selected: <strong>{selectedFile.name}</strong></p>
                        <p>Size: {(selectedFile.size / 1024).toFixed(2)} KB</p>
                    </div>
                )}

                {message && (
                    <div className="message success">
                        {message}
                    </div>
                )}

                {error && (
                    <div className="message error">
                        ✗ {error}
                    </div>
                )}

                <button
                    onClick={handleUpload}
                    disabled={!selectedFile || uploading}
                    className="upload-button"
                >
                    {uploading ? (
                        <>
                            <span className="spinner"></span>
                            Processing...
                        </>
                    ) : (
                        'Upload & Process'
                    )}
                </button>

                <div className="info-box">
                    <h3>How it works:</h3>
                    <ol>
                        <li>Upload your invoice PDF</li>
                        <li>AI extracts text and structures the data</li>
                        <li>Invoice is saved to the database</li>
                        <li>View it in the dashboard</li>
                    </ol>
                </div>
            </div>
        </div>
    );
}

export default UploadPage;
