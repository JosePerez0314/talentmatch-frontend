import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const savedUser = localStorage.getItem('tm_user');
        // El token se guarda por separado para que el apiClient lo encuentre
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
        setLoading(false);
    }, []);

    // 👈 ACTUALIZADO: Ahora recibe el token de Railway
    const login = (email, token) => {
        const username = email.split('@')[0];

        const userData = {
            username: username,
            email: email,
            loginDate: new Date().toISOString()
        };

        setUser(userData);
        // Guardamos el objeto de usuario para la UI
        localStorage.setItem('tm_user', JSON.stringify(userData));
        // 👈 CLAVE: Guardamos el token exacto que pide el apiClient
        localStorage.setItem('token', token);
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('tm_user');
        localStorage.removeItem('token'); // 👈 Limpieza total
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);