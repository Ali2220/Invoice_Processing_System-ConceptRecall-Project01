import { createContext, useState, useEffect } from 'react';

/**
 * AuthContext: Humari App ki "Global Memory"
 * Is ka kaam hai ye yaad rakhna ke user login hai ya nahi.
 */
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    // 'user' variable mein user ki details hogi (name, email etc)
    // Agar user null hai, toh matlab koi login nahi hai.
    const [user, setUser] = useState(null);

    // 'loading' se humein pata chalta hai ke hum check kar rahe hain user login hai ya nahi
    const [loading, setLoading] = useState(true);

    /**
     * useEffect: Ye function page refresh hotay hi sab se pehle chalta hai.
     * Hum check karte hain ke kya browser ki memory (localStorage) mein koi purana user save hai?
     */
    useEffect(() => {
        const checkUser = () => {
            const savedUser = localStorage.getItem('user');
            if (savedUser) {
                // Agar user mil gaya, toh usay state mein save karlo
                setUser(JSON.parse(savedUser));
            }
            setLoading(false); // Check mukammal ho gaya
        };

        checkUser();
    }, []);

    /**
     * login: Jab backend se login success ho jaye, toh is function ko bulaya jayega.
     */
    const login = (userData) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    /**
     * logout: User ka data khatam karne ke liye.
     */
    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
    };

    // Value mein hum wo cheezein bhejte hain jo baqi components (pages) ko chaiye
    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
