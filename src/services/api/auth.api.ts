import { apiClient } from "./apiClient";
import { UserData } from "../../components/context/AuthContext";
import { ApiResponse } from "../../types/api.types";

export interface LoginCredentials {
  email: string;
  password: string; 
}
export interface RegisterCredentials extends LoginCredentials {
  username: string;
}

export interface LoginResponseData {
  user: UserData;
  token: string;
}

export const authService = {
  // POST /users/login
  login: async (credentials: LoginCredentials): Promise<ApiResponse<LoginResponseData>> => {
    return apiClient('/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
  },

  // POST /users/
  register: async (data: RegisterCredentials): Promise<ApiResponse<LoginResponseData>> => {
    return apiClient('/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },
};