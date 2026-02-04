import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'; // Context ko import kiya

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        {/* Poori App ko AuthProvider mein wrap kar diya */}
        <AuthProvider>
            <App />
        </AuthProvider>
    </React.StrictMode>,
)
