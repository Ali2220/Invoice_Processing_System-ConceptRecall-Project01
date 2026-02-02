import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

/**
 * Navigation Bar Component
 * Provides navigation between pages
 */
function Navbar() {
    const location = useLocation();

    const isActive = (path) => {
        return location.pathname === path ? 'active' : '';
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <div className="navbar-brand">
                    <span className="brand-icon">📊</span>
                    <span className="brand-text">Invoice Processing</span>
                </div>

                <div className="navbar-links">
                    <Link to="/" className={`nav-link ${isActive('/')}`}>
                        📤 Upload
                    </Link>
                    <Link to="/dashboard" className={`nav-link ${isActive('/dashboard')}`}>
                        📋 Dashboard
                    </Link>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
