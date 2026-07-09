import { apiClient } from "./apiClient";
import { UserData } from "../../components/context/AuthContext";

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
  login: async (credentials: LoginCredentials): Promise<LoginResponseData> => {
    return apiClient<LoginResponseData>('/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
  },

  // POST /users/
  register: async (data: RegisterCredentials): Promise<LoginResponseData> => {
    return apiClient<LoginResponseData>('/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },
};