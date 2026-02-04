import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

/**
 * ProtectedRoute: Aik Chaukidaar component
 * Is ka kaam hai check karna ke user login hai ya nahi.
 */
const ProtectedRoute = ({ children }) => {
    const { user, loading } = useContext(AuthContext);

    // Agar hum check kar rahe hain (loading), toh thora ruk jao
    if (loading) {
        return <div>Loading...</div>;
    }

    // Agar user log-in nahi hai, toh usay '/login' page par bhej do
    if (!user) {
        return <Navigate to="/login" />;
    }

    // Agar user log-in hai, toh usay page dikha do
    return children;
};

export default ProtectedRoute;
