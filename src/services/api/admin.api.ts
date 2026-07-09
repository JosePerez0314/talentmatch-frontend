import { apiClient } from "./apiClient";
import { User, UserRole } from "../../types/api.types";

// --- TIPADOS DE RESPUESTA SEGÚN DOCUMENTACIÓN DE LA API ---

export interface AdminStatsResponse {
  usersCount: number;
  candidatesCount: number;
  positionsCount: number;
  vacanciesCount: number;
  activeVacancies: number;
  closedVacancies: number;
}

export interface AdminUsersResponse {
  users: User[];
  meta: {
    totalCount: number;
    currentPage: number;
    totalPages: number;
  };
}

// --- SERVICIO DE ADMINISTRACIÓN ---

export const adminService = {
  // GET /api/admin/stats
  getStats: async (): Promise<AdminStatsResponse> => {
    return apiClient<AdminStatsResponse>('/admin/stats', {
      method: 'GET',
    });
  },

  // GET /api/admin/users
  getUsers: async (page: number = 1, limit: number = 50): Promise<AdminUsersResponse> => {
    return apiClient<AdminUsersResponse>(`/admin/users?page=${page}&limit=${limit}`, {
      method: 'GET',
    });
  },

  // PUT /api/admin/users/:id/role
  // Nota: La documentación marca PUT, no PATCH para el cambio de rol.
  updateRole: async (userId: string | number, newRole: UserRole): Promise<User> => {
    return apiClient<User>(`/admin/users/${userId}/role`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: newRole }),
    });
  },

  // DELETE /api/admin/users/:id
  deleteUser: async (userId: string | number): Promise<void> => {
    return apiClient<void>(`/admin/users/${userId}`, {
      method: 'DELETE',
    });
  }
};