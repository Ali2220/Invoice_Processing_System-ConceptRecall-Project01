import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import UploadPage from './pages/UploadPage';
import DashboardPage from './pages/DashboardPage';
import InvoiceDetailPage from './pages/InvoiceDetailPage';
import './App.css';

/**
 * Main App Component
 * Handles routing and layout
 */
function App() {
    return (
        <Router>
            <div className="app">
                <Navbar />
                <Routes>
                    <Route path="/" element={<UploadPage />} />
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/invoice/:id" element={<InvoiceDetailPage />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
