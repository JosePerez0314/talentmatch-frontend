import React, { createContext, useContext, useState, ReactNode } from "react";

// 1. Definimos la estructura exacta del Objeto Usuario que guardas en localStorage
export interface UserData {
  username: string;
  email: string;
  loginDate: string;
}

// 2. Definimos el contrato de todo lo que expone tu Contexto de Autenticación
interface AuthContextType {
  user: UserData | null;
  loading: boolean;
  login: (email: string, token: string) => void;
  logout: () => void;
}

// 3. Tipamos el contexto inicial (inicializado en undefined para obligar el uso del Provider)
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 4. Tipamos las propiedades del componente (Criterio de Aceptación: interfaces estrictas)
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // Inicialización síncrona con tipado explícito para el estado del usuario
  const [user, setUser] = useState<UserData | null>(() => {
    try {
      const savedUser = localStorage.getItem("tm_user");
      return savedUser ? (JSON.parse(savedUser) as UserData) : null;
    } catch (error) {
      console.error("Error leyendo el localStorage:", error);
      return null;
    }
  });

  const [loading, setLoading] = useState<boolean>(false);

  const login = (email: string, token: string): void => {
    setLoading(true);
    try {
      const username = email.split('@')[0];

      const userData: UserData = {
        username,
        email,
        loginDate: new Date().toISOString()
      };

      setUser(userData);

      localStorage.setItem("tm_user", JSON.stringify(userData));
      localStorage.setItem("token", token);
    } finally {
      setLoading(false);
    }
  };

  const logout = (): void => {
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

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
};