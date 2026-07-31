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
    const [searchTerm, setSearchTerm]     = useState<string>('');
    const [confirmingId, setConfirmingId] = useState<string | null>(null);
    const [deletingId, setDeletingId]     = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleDelete = async (userId: string) => {
        try {
            setDeletingId(userId);
            setConfirmingId(null);
            setErrorMessage(null);
            await adminService.deleteUser(userId);
            onDeleted();
        } catch (error) {
            console.error("Error al eliminar usuario:", error);
            setErrorMessage("No se pudo eliminar el usuario. Intenta nuevamente.");
        } finally {
            setDeletingId(null);
        }
    };

    if (isLoading) {
        return (
            <div className="bg-white rounded-2xl shadow-sm flex justify-center items-center h-44 border border-gray-100">
                <Loader2 className="animate-spin text-red-500" size={26} />
            </div>
        );
    }

    const filteredUsers = users.filter(user =>
        user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
            {/* Header Responsivo */}
            <div className="px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 bg-red-50">
                        <UserMinus size={14} className="text-red-500" />
                    </div>
                    <p className="text-sm font-semibold text-gray-700">Eliminar usuario</p>
                </div>
                <input
                    type="text"
                    placeholder="Buscar usuario…"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="text-xs border border-gray-200 rounded-lg px-3 py-2 w-full sm:w-56 outline-none focus:border-red-300 transition-colors bg-gray-50/50 placeholder:text-gray-400"
                />
            </div>

            <div className="p-5">
                <div className="flex items-start sm:items-center gap-2.5 px-4 py-3 rounded-xl mb-5 text-xs bg-orange-50 border border-orange-200 shadow-sm">
                    <AlertTriangle size={16} className="text-orange-500 flex-shrink-0 mt-0.5 sm:mt-0" />
                    <span className="text-orange-800 font-medium leading-relaxed">
                        Eliminar un usuario es una <strong>acción permanente</strong>. No se puede deshacer.
                    </span>
                </div>

                {errorMessage && (
                    <div className="rounded-xl border border-red-200 bg-red-50 text-red-700 text-xs font-semibold p-3 mb-4 shadow-sm">
                        {errorMessage}
                    </div>
                )}

                <div className="space-y-3">
                    {filteredUsers.length === 0 ? (
                        <p className="text-center py-6 text-xs text-gray-400 font-medium">No se encontraron usuarios.</p>
                    ) : (
                        filteredUsers.map(user => {
                            const isConfirming = confirmingId === user.id;
                            const isDeleting   = deletingId   === user.id;

                            return (
                                <div
                                    key={user.id}
                                    /* El flex-wrap previene que los botones expulsen al nombre en mobile */
                                    className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 px-4 py-3 rounded-xl border transition-all shadow-sm"
                                    style={{
                                        borderColor: isConfirming ? '#FECACA' : '#F3F4F6',
                                        backgroundColor: isConfirming ? '#FEF2F2' : 'white',
                                    }}
                                >
                                    {/* Info Block */}
                                    <div className="flex items-center gap-3 min-w-[150px] flex-1">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0 shadow-sm ${user.role === 'ADMIN' ? 'bg-[#447ECA]' : 'bg-gray-400'}`}>
                                            {getInitials(user.username)}
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-sm font-semibold text-gray-800 truncate">{user.username}</span>
                                            <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">{user.role}</span>
                                        </div>
                                    </div>

                                    {/* Actions Block */}
                                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end mt-2 sm:mt-0 border-t sm:border-0 border-gray-100/50 pt-2 sm:pt-0">
                                        {isDeleting ? (
                                            <span className="flex items-center justify-center w-full sm:w-auto gap-2 text-xs font-bold text-red-500 bg-red-50 px-4 py-1.5 rounded-lg border border-red-100">
                                                <span className="w-3.5 h-3.5 border-2 border-red-300 border-t-red-600 rounded-full animate-spin" />
                                                Eliminando…
                                            </span>
                                        ) : isConfirming ? (
                                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                                <button
                                                    onClick={() => handleDelete(user.id)}
                                                    className="flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition-colors shadow-sm"
                                                >
                                                    Eliminar
                                                </button>
                                                <button
                                                    onClick={() => setConfirmingId(null)}
                                                    className="flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-bold border border-gray-200 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors bg-white shadow-sm"
                                                >
                                                    Cancelar
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => setConfirmingId(user.id)}
                                                className="flex items-center justify-center w-full sm:w-auto gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-all flex-shrink-0 shadow-sm"
                                            >
                                                <Trash2 size={12} /> Eliminar
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};