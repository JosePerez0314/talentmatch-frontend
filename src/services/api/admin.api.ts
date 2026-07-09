// src/services/api/admin.api.ts
import { AdminUser } from '../../types/admin.types';

// Datos temporales para pruebas
const MOCK_USERS: AdminUser[] = [
    { id: '1', username: 'Ana Garcia', email: 'ana@ejemplo.com', role: 'admin', avatar: 'AG', lastAccessed: '2026-07-07' },
    { id: '2', username: 'Carlos Perez', email: 'carlos@ejemplo.com', role: 'user', avatar: 'CP', lastAccessed: '2026-07-06' },
    { id: '3', username: 'Beatriz Solis', email: 'beatriz@ejemplo.com', role: 'user', avatar: 'BS', lastAccessed: '2026-07-05' },
];

export const adminService = {
    getStats: async (): Promise<any> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    totalUsers: 145,
                    admins: 4,
                    standardUsers: 141,
                    positions: 12,
                    totalVacancies: 34,
                    activeVacancies: 8,
                    candidates: 256,
                    evaluations: 89
                });
            }, 800);
        });
    },

    getUsers: async (page: number, limit: number): Promise<AdminUser[]> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log(`Fetching page ${page} with limit ${limit}`);
                resolve(MOCK_USERS);
            }, 500);
        });
    },

    updateRole: async (userId: string, newRole: string): Promise<{ success: boolean }> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log(`Rol de ${userId} actualizado a ${newRole}`);
                resolve({ success: true });
            }, 500);
        });
    },

    deleteUser: async (userId: string): Promise<{ success: boolean }> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log(`Usuario ${userId} eliminado`);
                resolve({ success: true });
            }, 500);
        });
    }
};