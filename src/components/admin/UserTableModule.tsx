import React, { useState } from 'react';
import { Users, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { adminService } from '../../services/api/admin.api';
// FIX: Cambiamos AdminUser por el tipo User oficial de la API
import { User } from '../../types/api.types';

export const UserTableModule: React.FC = () => {
    // FIX: Tipamos con User oficial
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [page, setPage] = useState<number>(1);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const limit = 10;

    const fetchUsers = useCallback(async (pageNum: number) => {
        try {
            setIsLoading(true);
            const response = await adminService.getUsers(pageNum, limit);
            
            const usersArray = response?.users || [];
            setUsers(usersArray);
        } catch (error) {
            console.error("Error al cargar usuarios:", error);
        } finally {
            setIsLoading(false);
        }
    }, [limit]);

const formatDate = (iso?: string): string => {
    if (!iso) return '-';
    const parsed = new Date(iso);
    if (Number.isNaN(parsed.getTime())) return '-';
    return parsed.toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' });
};

    const filteredUsers = users.filter(user =>
        user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="bg-white rounded-[24px] border border-gray-100 p-8 shadow-sm overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-2.5">
                    <div className="p-1.5 bg-blue-50 text-blue-500 rounded-lg">
                        <Users size={16} strokeWidth={2.5} />
                    </div>
                    <h2 className="text-sm font-bold text-gray-700 tracking-tight">Todos los usuarios</h2>
                </div>
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Buscar usuario..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="text-xs border border-gray-200/80 rounded-xl px-4 py-2 w-full sm:w-60 outline-none focus:border-blue-400 bg-gray-50/50 text-gray-700 transition-all placeholder:text-gray-400"
                    />
                </div>
            </div>

            <div className="overflow-x-auto -mx-8">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50/70 border-y border-gray-100 text-gray-400 text-[11px] uppercase font-bold tracking-wider">
                        <tr>
                            <th className="px-8 py-3.5">Usuario</th>
                            <th className="px-8 py-3.5">Email</th>
                            <th className="px-8 py-3.5">Rol</th>
                            <th className="px-8 py-3.5">Fecha de creación</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {isLoading ? (
                            <tr>
                                <td colSpan={4} className="py-12 text-center">
                                    <Loader2 className="animate-spin text-blue-500 mx-auto" size={24} />
                                </td>
                            </tr>
                        ) : filteredUsers.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="py-8 text-center text-xs text-gray-400 font-medium">
                                    No se encontraron usuarios.
                                </td>
                            </tr>
                        ) : (
                            filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50/40 transition-colors">
                                    <td className="px-8 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-sm uppercase shrink-0">
                                                {user.username?.substring(0, 2) || 'US'}
                                            </div>
                                            <span className="text-xs font-semibold text-gray-700">{user.username}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-4 text-xs text-gray-500 font-medium">
                                        {user.email}
                                    </td>
                                    <td className="px-8 py-4">
                                        {/* FIX: user.role es oficialmente 'ADMIN' o 'USER', la comparación ya no arroja error */}
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase ${user.role === 'ADMIN' ? 'bg-blue-50 text-blue-600 border border-blue-100/70' : 'bg-gray-50 text-gray-500 border border-gray-100'}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-8 py-4 text-xs text-gray-400 font-medium">
                                        {/* FIX: Se corrigió createdAt en lugar de invented date */}
                                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-gray-100 mt-2">
                <p className="text-xs font-semibold text-gray-400">
                    Página {meta.currentPage} de {meta.totalPages} · {meta.totalCount} usuarios
                </p>
                <div className="flex gap-1.5">
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded-lg border border-gray-200/60 hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-transparent transition-colors text-gray-500">
                        <ChevronLeft size={16} />
                    </button>
                    <button onClick={() => setPage(p => p + 1)} className="p-1.5 rounded-lg border border-gray-200/60 hover:bg-gray-50 transition-colors text-gray-500">
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};
