import { apiClient } from "./apiClient";
import {
    Department,
    CreateDepartmentInput,
    UpdateDepartmentInput
} from "../../types/department.types";

export const departmentsApi = {
    /**
     * GET /departments/
     * Lista todos los departamentos mapeando 'title' de vuelta a 'name' de forma segura.
     */
    getAll: async (): Promise<Department[]> => {
        const res = await apiClient<any>("/departments/");

        // Extraemos el arreglo real navegando de forma segura por res.response.data
        const rawDepartments = (res && res.response && Array.isArray(res.response.data))
            ? res.response.data
            : [];

        // Normalizamos las propiedades para que hagan match con tu UI
        return rawDepartments.map((dept: any) => ({
            ...dept,
            id: dept.id || dept._id,
            name: dept.title || dept.name || "Sin nombre",
            positionsCount: dept.positionsCount || dept.positions?.length || 0,
            createdAt: dept.createdAt || dept.created_at
        })) as Department[];
    },

    /**
     * GET /departments/:id
     * Obtiene el detalle de un departamento específico por ID.
     */
    getById: async (id: string): Promise<Department> => {
        const res = await apiClient<any>(`/departments/${id}`);

        // Extraemos el objeto del departamento desde res.response.data
        const dept = (res && res.response && res.response.data) ? res.response.data : res;

        return {
            ...dept,
            id: dept.id || dept._id,
            name: dept.title || dept.name || "Sin nombre",
            positionsCount: dept.positionsCount || dept.positions?.length || 0,
            createdAt: dept.createdAt || dept.created_at
        } as Department;
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
                title: input.name
            }),
        });
    },

    /**
     * PUT /departments/:id
     * Actualiza el departamento mapeando 'name' a 'title' para el validador del backend.
     */
    update: async (id: string, input: UpdateDepartmentInput): Promise<Department> => {
        return apiClient<Department>(`/departments/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                title: input.name
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