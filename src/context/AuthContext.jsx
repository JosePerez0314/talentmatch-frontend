import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    // 💡 CAMBIO CLAVE: Inicializamos el estado directamente desde localStorage
    // Esto ocurre INSTANTÁNEAMENTE antes de que React renderice nada.
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('tm_user');
        return savedUser ? JSON.parse(savedUser) : null;
    });

    // Si ya encontramos al usuario arriba, no necesitamos mostrar un "cargando"
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Mantenemos esto por si necesitas validar el token con el servidor al cargar
        const savedUser = localStorage.getItem('tm_user');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
        setLoading(false);
    }, []);

    const login = (email, token) => {
        const username = email.split('@')[0];
        const userData = {
            username: username,
            email: email,
            loginDate: new Date().toISOString()
        };

        setUser(userData);
        localStorage.setItem('tm_user', JSON.stringify(userData));
        localStorage.setItem('token', token);
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('tm_user');
        localStorage.removeItem('token');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);