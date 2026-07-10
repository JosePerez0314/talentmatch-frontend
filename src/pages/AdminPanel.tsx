import React, { useCallback, useEffect, useState } from 'react';
import { Shield } from 'lucide-react';
import { StatsModule } from '../components/admin/StatsModule';
import { UserTableModule } from '../components/admin/UserTableModule';
import { RoleUpdateModule } from '../components/admin/RoleUpdateModule';
import { UserDeleteModule } from '../components/admin/UserDeleteModule';
import { useAuth } from '../components/context/AuthContext';
import { adminService, AdminUsersPageMeta } from '../services/api/admin.api';
import { User } from '../types/api.types';

const EMPTY_META: AdminUsersPageMeta = { totalCount: 0, currentPage: 1, totalPages: 1 };

const AdminPanel: React.FC = () => {
    const { user } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [meta, setMeta] = useState<AdminUsersPageMeta>(EMPTY_META);
    const [page, setPage] = useState<number>(1);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const limit = 10;

    const fetchUsers = useCallback(async (pageNum: number) => {
        try {
            setIsLoading(true);
            setErrorMessage(null);
            const data = await adminService.getUsers(pageNum, limit);
            setUsers(data.users ?? []);
            setMeta(data.meta ?? EMPTY_META);
        } catch (err) {
            console.error("Error al cargar usuarios:", err);
            setErrorMessage("No se pudo cargar la lista de usuarios.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers(page);
    }, [page, fetchUsers]);

    const refetch = useCallback(() => fetchUsers(page), [fetchUsers, page]);

    const displayName = user?.username ?? '—';
    const roleLabel = user?.role === 'ADMIN' ? 'Admin' : 'Usuario';

    return (
        <div className="p-12 bg-[#f8fafc] min-h-screen space-y-6 overflow-y-auto">
            {/* Encabezado Principal */}
            <div className="flex items-center justify-between pb-2">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl shadow-sm border border-blue-100/50">
                        <Shield size={22} strokeWidth={2} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Panel de Administración</h1>
                        <p className="text-xs text-gray-400 font-medium mt-0.5">
                            Sesión: <span className="font-semibold text-gray-500">{displayName}</span> · Solo visible para administradores
                        </p>
                    </div>
                </div>

                {/* Píldora del rol en la esquina derecha del Figma */}
                <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-semibold border border-blue-100/80 shadow-sm">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span>
                    {roleLabel}
                </div>
            </div>

            {errorMessage && (
                <div className="rounded-2xl border border-red-200 bg-red-50 text-red-700 text-xs font-semibold p-4">
                    {errorMessage}
                </div>
            )}

            <div className="space-y-6">
                <StatsModule />
                <UserTableModule
                    users={users}
                    meta={meta}
                    page={page}
                    isLoading={isLoading}
                    onPageChange={setPage}
                />
                <RoleUpdateModule
                    users={users}
                    isLoading={isLoading}
                    onSaved={refetch}
                />
                <UserDeleteModule
                    users={users}
                    isLoading={isLoading}
                    onDeleted={refetch}
                />
            </div>
        </div>
    );
};

export default AdminPanel;
