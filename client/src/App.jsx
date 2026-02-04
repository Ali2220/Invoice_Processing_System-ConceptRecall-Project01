import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import UploadPage from './pages/UploadPage';
import DashboardPage from './pages/DashboardPage';
import InvoiceDetailPage from './pages/InvoiceDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProtectedRoute from './components/ProtectedRoute'; // Chaukidaar import kiya
import './App.css';

/**
 * Main App Component
 * Ab ye Auth-Aware hai (Isay pata hai user kaun hai)
 */
function App() {
    return (
        <Router>
            <div className="app">
                <Navbar />
                <Routes>
                    {/* 1. Public Routes: Inhein har koi dekh sakta hai */}
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />

                    {/* 2. Protected Routes: Inhein sirf logged-in users dekh sakte hain */}
                    <Route
                        path="/"
                        element={
                            <ProtectedRoute>
                                <UploadPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <DashboardPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/invoice/:id"
                        element={
                            <ProtectedRoute>
                                <InvoiceDetailPage />
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
