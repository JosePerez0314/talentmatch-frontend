import { apiClient } from "./apiClient";
import { User, UserRole } from "../../types/api.types";

// Shape from GET /api/admin/stats — see api-documentation §6.
// Global counters, not scoped to the current user.
export interface AdminStats {
  usersCount: number;
  candidatesCount: number;
  positionsCount: number;
  vacanciesCount: number;
  activeVacancies: number;
  closedVacancies: number;
}

// Shape from GET /api/admin/users — see api-documentation §6.
export interface AdminUsersPageMeta {
  totalCount: number;
  currentPage: number;
  totalPages: number;
}

export interface AdminUsersPage {
  users: User[];
  meta: AdminUsersPageMeta;
}

export const adminService = {
  getStats: (): Promise<AdminStats> =>
    apiClient<AdminStats>("/admin/stats", { method: "GET" }),

  getUsers: (page: number = 1, limit: number = 50): Promise<AdminUsersPage> =>
    apiClient<AdminUsersPage>(
      `/admin/users?page=${page}&limit=${limit}`,
      { method: "GET" },
    ),

  updateRole: (id: string | number, role: UserRole): Promise<User> =>
    apiClient<User>(`/admin/users/${id}/role`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    }),

  deleteUser: (id: string | number): Promise<void> =>
    apiClient<void>(`/admin/users/${id}`, { method: "DELETE" }),
};
