import React, { useState } from 'react';
import { Users, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { User } from '../../types/api.types';
import { AdminUsersPageMeta } from '../../services/api/admin.api';

interface UserTableModuleProps {
    users: User[];
    meta: AdminUsersPageMeta;
    page: number;
    isLoading: boolean;
    onPageChange: (page: number) => void;
}

const formatDate = (iso?: string): string => {
    if (!iso) return '-';
    const parsed = new Date(iso);
    if (Number.isNaN(parsed.getTime())) return '-';
    return parsed.toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const UserTableModule: React.FC<UserTableModuleProps> = ({
    users,
    meta,
    page,
    isLoading,
    onPageChange,
}) => {
    const [searchTerm, setSearchTerm] = useState<string>('');

    const filteredUsers = users.filter(user =>
        user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {/* Section header */}
            <div className="px-5 py-3.5 flex items-center justify-between gap-3 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 bg-[#F0FDFA]">
                        <Users size={14} className="text-teal-600" />
                    </div>
                    <p className="text-sm text-gray-700">Todos los usuarios</p>
                </div>
                <input
                    type="text"
                    placeholder="Buscar usuario…"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="text-xs border border-gray-200 rounded-lg px-3 py-2 w-full sm:w-56 outline-none focus:border-[#447ECA] transition-colors bg-white placeholder:text-gray-400"
                />
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-xs">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                            <th className="px-5 py-3 text-left text-gray-500 font-medium">Usuario</th>
                            <th className="px-5 py-3 text-left text-gray-500 font-medium hidden sm:table-cell">Email</th>
                            <th className="px-5 py-3 text-left text-gray-500 font-medium">Rol</th>
                            <th className="px-5 py-3 text-left text-gray-500 font-medium hidden md:table-cell">Creado</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {isLoading ? (
                            <tr>
                                <td colSpan={4} className="py-10 text-center">
                                    <Loader2 className="animate-spin text-[#447ECA] mx-auto" size={22} />
                                </td>
                            </tr>
                        ) : filteredUsers.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="py-8 text-center text-xs text-gray-400">No se encontraron usuarios.</td>
                            </tr>
                        ) : (
                            filteredUsers.map(user => (
                                <tr key={user.id} className="hover:bg-gray-50/60 transition-colors">
                                    <td className="px-5 py-3">
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] text-white flex-shrink-0"
                                                style={{ backgroundColor: user.role === 'ADMIN' ? '#447ECA' : '#6B7280' }}
                                            >
                                                {user.email.split('@')[0][0].toUpperCase()}
                                            </div>
                                            <span className="text-gray-700">{user.email.split('@')[0]}</span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-3 text-gray-400 hidden sm:table-cell">{user.email}</td>
                                    <td className="px-5 py-3">
                                        <span
                                            className="px-2 py-0.5 rounded-full text-[10px]"
                                            style={user.role === 'ADMIN'
                                                ? { backgroundColor: '#EFF6FF', color: '#447ECA' }
                                                : { backgroundColor: '#F3F4F6', color: '#6B7280' }
                                            }
                                        >
                                            {user.role === 'ADMIN' ? 'admin' : 'user'}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3 text-gray-400 hidden md:table-cell">{formatDate(user.createdAt)}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
                <p className="text-xs text-gray-400">
                    Página {meta.currentPage} de {meta.totalPages} · {meta.totalCount} usuarios
                </p>
                <div className="flex gap-1.5">
                    <button
                        onClick={() => onPageChange(Math.max(1, page - 1))}
                        disabled={page <= 1}
                        className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 transition-colors text-gray-500"
                    >
                        <ChevronLeft size={14} />
                    </button>
                    <button
                        onClick={() => onPageChange(page + 1)}
                        disabled={page >= meta.totalPages}
                        className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 transition-colors text-gray-500"
                    >
                        <ChevronRight size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
};
