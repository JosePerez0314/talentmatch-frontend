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

    const displayName = user?.username ?? '—';

    return (
        <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">

            {/* Page header */}
            <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-[#EFF6FF]">
                    <Shield size={18} className="text-[#447ECA]" />
                </div>
                <div>
                    <h1 className="text-gray-800 font-medium">Panel de Administración</h1>
                    <p className="text-xs text-gray-400 mt-0.5">
                        Sesión: <strong className="text-gray-600">{displayName}</strong> · Solo visible para administradores
                    </p>
                </div>
                <span
                    className="ml-auto text-[10px] px-2.5 py-1 rounded-full flex items-center gap-1 flex-shrink-0 border"
                    style={{ backgroundColor: '#EFF6FF', color: '#447ECA', borderColor: '#BFDBFE' }}
                >
                    <Shield size={9} /> admin
                </span>
            </div>

            {errorMessage && (
                <div className="rounded-2xl border border-red-200 bg-red-50 text-red-700 text-xs font-semibold p-4">
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
