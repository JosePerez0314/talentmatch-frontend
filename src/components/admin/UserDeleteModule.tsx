import React, { useState } from 'react';
import { Trash2, UserMinus, AlertTriangle, Loader2 } from 'lucide-react';
import { adminService } from '../../services/api/admin.api';
import { User } from '../../types/api.types';

interface UserDeleteModuleProps {
    users: User[];
    isLoading: boolean;
    onDeleted: () => void;
}

const getInitials = (name?: string): string =>
    (name ?? '').trim().slice(0, 2).toUpperCase() || 'US';

export const UserDeleteModule: React.FC<UserDeleteModuleProps> = ({ users, isLoading, onDeleted }) => {
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [pendingDelete, setPendingDelete] = useState<Record<string, boolean>>({});
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleDelete = async (userId: string, username: string) => {
        const confirmed = window.confirm(
            `¿Eliminar a ${username}? Esta acción es permanente.`,
        );
        if (!confirmed) return;

        try {
            setPendingDelete((prev) => ({ ...prev, [userId]: true }));
            setErrorMessage(null);
            await adminService.deleteUser(userId);
            onDeleted();
        } catch (error) {
            console.error("Error al eliminar usuario:", error);
            setErrorMessage("No se pudo eliminar el usuario. Intenta nuevamente.");
        } finally {
            setPendingDelete((prev) => ({ ...prev, [userId]: false }));
        }
    };

    if (isLoading) {
        return (
            <div className="bg-white rounded-[24px] border border-gray-100 p-8 shadow-sm flex justify-center items-center h-44">
                <Loader2 className="animate-spin text-blue-500" size={26} />
            </div>
        );
    }

    const filteredUsers = users.filter(user =>
        user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="bg-white rounded-[24px] border border-gray-100 p-8 shadow-sm">
            {/* Cabecera del módulo con Buscador */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-2.5">
                    <div className="p-1.5 bg-red-50 text-red-500 rounded-lg">
                        <UserMinus size={16} strokeWidth={2.5} />
                    </div>
                    <h2 className="text-sm font-bold text-gray-700 tracking-tight">Eliminar usuario</h2>
                </div>
                <div>
                    <input
                        type="text"
                        placeholder="Buscar usuario..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="text-xs border border-gray-200/80 rounded-xl px-4 py-2 w-full sm:w-60 outline-none focus:border-blue-400 bg-gray-50/50 text-gray-700 transition-all placeholder:text-gray-400"
                    />
                </div>
            </div>

            {/* Banner de advertencia */}
            <div className="bg-orange-50 border border-orange-100/60 rounded-xl p-4 mb-6 flex items-center gap-3 shadow-sm">
                <div className="p-1 bg-white text-orange-600 rounded-lg border border-orange-100 shadow-sm shrink-0">
                    <AlertTriangle size={16} strokeWidth={2.5} />
                </div>
                <p className="text-xs text-orange-800 font-semibold tracking-wide">
                    Esta acción es permanente y no se puede revertir.
                </p>
            </div>

            {errorMessage && (
                <div className="rounded-xl border border-red-200 bg-red-50 text-red-700 text-xs font-semibold p-3 mb-4">
                    {errorMessage}
                </div>
            )}

            {/* Lista de usuarios con diseño Figma */}
            <div className="space-y-2.5">
                {filteredUsers.length === 0 ? (
                    <p className="text-center py-4 text-xs text-gray-400 font-medium">No se encontraron usuarios.</p>
                ) : (
                    filteredUsers.map((user) => {
                        const deleting = pendingDelete[user.id];
                        return (
                            <div
                                key={user.id}
                                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-gray-100/70 bg-white hover:shadow-sm transition-all gap-4"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-sm uppercase shrink-0">
                                        {getInitials(user.username)}
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-700 text-xs tracking-tight">{user.username}</p>
                                        <p className="text-[11px] text-gray-400 font-medium mt-0.5">{user.email}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 justify-end shrink-0">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${user.role === 'ADMIN'
                                        ? 'bg-blue-50 text-blue-600 border border-blue-100/50'
                                        : 'bg-gray-50 text-gray-500 border border-gray-100'
                                        }`}
                                    >
                                        {user.role === 'ADMIN' ? 'Admin' : 'Usuario'}
                                    </span>

                                    <button
                                        type="button"
                                        aria-label="Eliminar usuario"
                                        disabled={deleting}
                                        onClick={() => handleDelete(user.id, user.username)}
                                        className="flex items-center gap-1.5 px-3 py-1.5 border border-red-200 text-red-600 bg-red-50/50 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-xs font-bold transition-all shadow-sm"
                                    >
                                        <Trash2 size={13} strokeWidth={2.5} />
                                        {deleting ? 'Eliminando...' : 'Eliminar'}
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};
