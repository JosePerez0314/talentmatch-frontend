import { apiClient } from "./apiClient";
import {
  LoginCredentials,
  LoginResponse,
  RegisterCredentials,
} from "../../types/auth.types";

export const authService = {
  // POST /users/login
  // `skipAuthRedirect`: a 401 here means "wrong email or password", not an
  // expired session, so apiClient must not tear the session down and redirect.
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    return apiClient<LoginResponse>("/users/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
      skipAuthRedirect: true,
    });
  },

  // POST /users/
  register: async (data: RegisterCredentials): Promise<LoginResponse> => {
    return apiClient<LoginResponse>("/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      skipAuthRedirect: true,
    });
  },
};
