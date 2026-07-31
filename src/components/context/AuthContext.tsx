import React, { createContext, useContext, useState, ReactNode } from "react";
import {
  AuthContextValue,
  LoginSession,
  SessionUser,
} from "../../types/auth.types";
import {
  clearStoredSession,
  readStoredSession,
  storeSession,
} from "../../services/session";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const deriveUsername = (email: string, username?: string): string => {
  if (username && username.trim().length > 0) return username.trim();
  if (email && email.includes("@")) return email.split("@")[0];
  return "Usuario";
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<SessionUser | null>(readStoredSession);

  const login = ({ email, token, role, username }: LoginSession) => {
    const userData: SessionUser = {
      email,
      role,
      username: deriveUsername(email, username),
    };

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