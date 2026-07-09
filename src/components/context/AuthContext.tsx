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

/** The API never returns a username, so we derive one from the email local-part. */
const deriveUsername = (email: string, username?: string): string =>
  username?.trim() || email.split("@")[0];

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
