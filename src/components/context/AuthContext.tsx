import React, { createContext, useContext, useState, ReactNode } from "react";
import { UserRole } from "../../types/api.types"; // <-- Importamos la fuente de verdad

export interface UserData {
  email: string;
  role: UserRole; // <-- Usamos el tipado oficial ('ADMIN' | 'USER')
  username?: string;
}

interface AuthContextType {
  user: UserData | null;
  login: (email: string, token: string, role: UserRole, username?: string) => void;
  logout: () => void;
}

  const login = ({ email, token, role, username }: LoginSession) => {
    const userData: SessionUser = {
      email,
      role,
      username: deriveUsername(email, username),
    };

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserData | null>(() => {
    const savedUser = localStorage.getItem("tm_user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = (email: string, token: string, role: UserRole, username?: string) => {
    // Si no viene username, usamos el email como fallback
    const userData: UserData = { email, role, username: username || email.split('@')[0] };
    setUser(userData);
    storeSession(userData, token);
  };

  const logout = () => {
    setUser(null);
    clearStoredSession();
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
