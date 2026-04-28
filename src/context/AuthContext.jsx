import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); // 👈 NUEVO

    useEffect(() => {
        const savedUser = localStorage.getItem('tm_user');

        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }

        setLoading(false); // 👈 IMPORTANTE
    }, []);

    const login = (email) => {
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
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);