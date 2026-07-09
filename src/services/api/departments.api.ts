import { apiClient } from "./apiClient";
import {
  Department,
  CreateDepartmentInput,
  UpdateDepartmentInput,
} from "../../types/department.types";

interface RawDepartment {
  id: number;
  title: string;
  userId: string;
  createdAt: string;
  updatedAt?: string;
  _count?: { positions: number };
}

const normalizeRawDepartment = (dept: RawDepartment): Department => ({
  id: String(dept.id),
  name: dept.title,
  positionsCount: dept._count?.positions ?? 0,
  createdAt: dept.createdAt,
});

export const departmentsApi = {
  getAll: async (): Promise<Department[]> => {
    const res = await apiClient<RawDepartment[]>("/departments/");
    return res.map(normalizeRawDepartment);
  },

  getById: async (id: string): Promise<Department> => {
    const res = await apiClient<RawDepartment>(`/departments/${id}`);
    return normalizeRawDepartment(res);
  },

  /**
   * POST /departments/
   * Crea un nuevo departamento transformando 'name' al campo 'title' requerido.
   */
  create: async (input: CreateDepartmentInput): Promise<Department> => {
    return apiClient<Department>("/departments/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: input.name,
      }),
    });
  },

  /**
   * PUT /departments/:id
   * Actualiza el departamento mapeando 'name' a 'title' para el validador del backend.
   */
  update: async (
    id: string,
    input: UpdateDepartmentInput,
  ): Promise<Department> => {
    return apiClient<Department>(`/departments/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: input.name,
      }),
    });
  },

  /**
   * DELETE /departments/:id
   * Elimina un departamento por su identificador.
   */
  delete: async (id: string): Promise<void> => {
    return apiClient<void>(`/departments/${id}`, {
      method: "DELETE",
    });
  },
};
