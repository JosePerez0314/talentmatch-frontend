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

// Función pura extraída para mantener el componente limpio y testeable
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

    // Filtrado derivado: No necesita useEffect (Principio DRY y React Patterns)
    const filteredUsers = users.filter(user =>
        user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {/* Header Responsivo: Pasa a columna en móviles pequeños */}
            <div className="px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 bg-[#F0FDFA]">
                        <Users size={14} className="text-teal-600" />
                    </div>
                    <p className="text-sm font-semibold text-gray-700">Todos los usuarios</p>
                </div>
                <input
                    type="text"
                    placeholder="Buscar usuario…"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="text-xs border border-gray-200 rounded-lg px-3 py-2 w-full sm:w-56 outline-none focus:border-[#447ECA] transition-colors bg-gray-50/50 placeholder:text-gray-400"
                />
            </div>

            {/* Contenedor de Scroll Horizontal */}
            <div className="w-full overflow-x-auto custom-scrollbar">
                {/* min-w-[600px] asegura que las columnas no se aplasten en mobile */}
                <table className="w-full text-xs min-w-[600px]">
                    <thead>
                        <tr className="bg-gray-50/70 border-b border-gray-100 text-gray-500 uppercase tracking-wider text-[10px] font-bold">
                            <th className="px-5 py-3 text-left">Usuario</th>
                            <th className="px-5 py-3 text-left hidden sm:table-cell">Email</th>
                            <th className="px-5 py-3 text-left">Rol</th>
                            <th className="px-5 py-3 text-left hidden md:table-cell">Creado</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {isLoading ? (
                            <tr>
                                <td colSpan={4} className="py-10 text-center">
                                    <Loader2 className="animate-spin text-[#447ECA] mx-auto" size={24} />
                                </td>
                            </tr>
                        ) : filteredUsers.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="py-8 text-center text-xs text-gray-400 font-medium">No se encontraron usuarios.</td>
                            </tr>
                        ) : (
                            filteredUsers.map(user => (
                                <tr key={user.id} className="hover:bg-gray-50/40 transition-colors">
                                    <td className="px-5 py-3">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0 shadow-sm"
                                                style={{ backgroundColor: user.role === 'ADMIN' ? '#447ECA' : '#6B7280' }}
                                            >
                                                {(user.username ?? 'U')[0].toUpperCase()}
                                            </div>
                                            <span className="text-gray-700 font-semibold">{user.username}</span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-3 text-gray-500 font-medium hidden sm:table-cell">{user.email}</td>
                                    <td className="px-5 py-3">
                                        <span
                                            className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase"
                                            style={user.role === 'ADMIN'
                                                ? { backgroundColor: '#EFF6FF', color: '#447ECA', border: '1px solid #BFDBFE' }
                                                : { backgroundColor: '#F9FAFB', color: '#6B7280', border: '1px solid #E5E7EB' }
                                            }
                                        >
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3 text-gray-400 font-medium hidden md:table-cell">{formatDate(user.createdAt)}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3 border-t border-gray-100 bg-gray-50/30">
                <p className="text-xs text-gray-500 font-medium">
                    Página {meta.currentPage} de {meta.totalPages} <span className="opacity-50">·</span> {meta.totalCount} usuarios
                </p>
                <div className="flex gap-1.5">
                    <button
                        onClick={() => onPageChange(Math.max(1, page - 1))}
                        disabled={page <= 1}
                        className="p-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 transition-colors text-gray-500 shadow-sm cursor-pointer disabled:cursor-not-allowed"
                    >
                        <ChevronLeft size={16} />
                    </button>
                    <button
                        onClick={() => onPageChange(page + 1)}
                        disabled={page >= meta.totalPages}
                        className="p-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 transition-colors text-gray-500 shadow-sm cursor-pointer disabled:cursor-not-allowed"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};