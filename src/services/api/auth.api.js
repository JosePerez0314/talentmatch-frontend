import { apiClient } from "./apiClient";
export const authService = {
  login: (credentials) => apiClient('/users/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  }),
};