import React, { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Inicialización síncrona para evitar redirecciones al refrescar
  const [user, setUser] = useState(() => {
    try {
      // Usamos "tm_user" consistentemente en toda la app
      const savedUser = localStorage.getItem("tm_user");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (error) {
      console.error("Error leyendo el localStorage:", error);
      return null;
    }
  });

  // Estado de carga para proteger las rutas durante la hidratación del estado
  const [loading, setLoading] = useState(false);

  const login = (email, token) => {
    setLoading(true);
    try {
      // Extrae el nombre antes del '@' (ej. admin@mail.com -> admin)
      const username = email.split('@')[0];
      
      const userData = { 
        username, 
        email,
        loginDate: new Date().toISOString() 
      };

      setUser(userData);

      // Guardado consistente en localStorage
      localStorage.setItem("tm_user", JSON.stringify(userData));
      localStorage.setItem("token", token);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("tm_user");
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
};