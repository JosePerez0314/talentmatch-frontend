import React, { useCallback, useEffect, useState } from 'react';
import { Shield } from 'lucide-react';
import { StatsModule }      from '../components/admin/StatsModule';
import { UserTableModule }  from '../components/admin/UserTableModule';
import { RoleUpdateModule } from '../components/admin/RoleUpdateModule';
import { UserDeleteModule } from '../components/admin/UserDeleteModule';
import { CreateUserModule } from '../components/admin/CreateUserModule';
import { useAuth }          from '../components/context/AuthContext';
import { adminService, AdminUsersPageMeta } from '../services/api/admin.api';
import { User } from '../types/api.types';

const EMPTY_META: AdminUsersPageMeta = { totalCount: 0, currentPage: 1, totalPages: 1 };

const AdminPanel: React.FC = () => {
    const { user } = useAuth();
    const [users, setUsers]               = useState<User[]>([]);
    const [meta, setMeta]                 = useState<AdminUsersPageMeta>(EMPTY_META);
    const [page, setPage]                 = useState<number>(1);
    const [isLoading, setIsLoading]       = useState<boolean>(true);
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

    useEffect(() => { fetchUsers(page); }, [page, fetchUsers]);

    const refetch = useCallback(() => fetchUsers(page), [fetchUsers, page]);

    const displayName = user?.username || (user as any)?.name || user?.email?.split('@')[0] || 'Administrador';

    return (
        <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6 md:space-y-8">
            
            {/* Page header - Optimizado para Mobile (Flex-wrap y min-w) */}
            <div className="flex flex-wrap items-center gap-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-blue-50 text-blue-600">
                    <Shield size={20} strokeWidth={2.5} />
                </div>
                <div className="flex-1 min-w-[200px]">
                    <h1 className="text-gray-900 font-bold text-lg md:text-xl tracking-tight">Panel de Administración</h1>
                    <p className="text-xs text-gray-500 mt-1 truncate">
                        Sesión: <strong className="text-gray-700 font-semibold">{displayName}</strong> · Solo visible para administradores
                    </p>
                </div>
                <span className="text-[10px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 flex-shrink-0 bg-blue-50 text-blue-600 border border-blue-100/70 uppercase tracking-wider">
                    <Shield size={10} strokeWidth={3} /> admin
                </span>
            </div>

            {errorMessage && (
                <div className="rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm font-medium p-4 flex items-center shadow-sm">
                    {errorMessage}
                </div>
            )}

            <StatsModule />

            <UserTableModule
                users={users}
                meta={meta}
                page={page}
                isLoading={isLoading}
                onPageChange={setPage}
            />

            <CreateUserModule onCreated={refetch} />

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
    );
};

export default AdminPanel;