import { apiClient } from "./apiClient";
import { UserData } from "../../components/context/AuthContext";
import { ApiResponse } from "../../types/api.types";

// 1. Interfaz estricta para los parámetros de entrada (Credenciales)
export interface LoginCredentials {
  email: string;
  password: string; // ¡Cambiado de token a password!
}

// 2. Interfaz para la respuesta específica del login
export interface LoginResponseData {
  user: UserData;
  token: string;
}

export const authService = {
  // 3. Declaración explícita del tipo de retorno usando Promesas e interfaces
  login: async (credentials: LoginCredentials): Promise<ApiResponse<LoginResponseData>> => {
    return apiClient('/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
  },
};