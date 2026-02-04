import { Link, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import './Navbar.css';

/**
 * Navigation Bar Component
 * Ab ye AuthContext use karta hai links dikhane ke liye
 */
function Navbar() {
    const location = useLocation();
    const { user, logout } = useContext(AuthContext); // Context se info li

    const isActive = (path) => {
        return location.pathname === path ? 'active' : '';
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <div className="navbar-brand">
                    <span className="brand-icon">📊</span>
                    <span className="brand-text">Invoice Pro</span>
                </div>

                <div className="navbar-links">
                    {/* Agar USER login hai toh ye links dikhao */}
                    {user ? (
                        <>
                            <Link to="/" className={`nav-link ${isActive('/')}`}>📤 Upload</Link>
                            <Link to="/dashboard" className={`nav-link ${isActive('/dashboard')}`}>📋 Invoices</Link>
                            <span style={{ marginLeft: '15px', color: '#666' }}>S'lam, {user.name}</span>
                            <button onClick={logout} className="nav-link" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'red' }}>
                                Logout
                            </button>
                        </>
                    ) : (
                        /* Agar login NAHI hai toh ye links dikhao */
                        <>
                            <Link to="/login" className={`nav-link ${isActive('/login')}`}>Login</Link>
                            <Link to="/register" className={`nav-link ${isActive('/register')}`}>Register</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
