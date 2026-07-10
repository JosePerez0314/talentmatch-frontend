import { apiClient } from "./apiClient";
import {
  LoginCredentials,
  LoginResponse,
  RegisterCredentials,
} from "../../types/auth.types";

export const authService = {
  // POST /users/login — public route, no token required.
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    return apiClient<LoginResponse>("/users/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
      isPublicEndpoint: true,
    });
  },

  // POST /users/ — public route, no token required.
  register: async (data: RegisterCredentials): Promise<LoginResponse> => {
    return apiClient<LoginResponse>("/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      isPublicEndpoint: true,
    });
  },
};
