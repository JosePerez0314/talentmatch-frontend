import React, { createContext, useContext, useState, ReactNode } from "react";

export interface UserData {
  email: string;
  role: 'admin' | 'user';
  username?: string; // Ahora permitimos username
}

interface AuthContextType {
  user: UserData | null;
  // Añadimos username opcional al login
  login: (email: string, token: string, role: 'admin' | 'user', username?: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserData | null>(() => {
    const savedUser = localStorage.getItem("tm_user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = (email: string, token: string, role: 'admin' | 'user', username?: string) => {
    // Si no viene username, usamos el email como fallback
    const userData: UserData = { email, role, username: username || email.split('@')[0] };
    setUser(userData);
    localStorage.setItem("tm_user", JSON.stringify(userData));
    localStorage.setItem("token", token);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("tm_user");
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return context;
};