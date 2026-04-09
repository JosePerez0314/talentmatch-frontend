import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    // Al cargar la app, revisamos si ya había alguien logueado en el navegador
    useEffect(() => {
        const savedUser = localStorage.getItem('tm_user');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
    }, []);

    const login = (email) => {
        // Lógica principal: Extraer el nombre antes del '@'
        const username = email.split('@')[0];

        const userData = {
            username: username,
            email: email,
            loginDate: new Date().toISOString()
        };

        setUser(userData);
        localStorage.setItem('tm_user', JSON.stringify(userData));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('tm_user');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// Hook personalizado para usar el contexto fácilmente
export const useAuth = () => useContext(AuthContext);