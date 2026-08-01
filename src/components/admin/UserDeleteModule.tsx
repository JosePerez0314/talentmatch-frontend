import React, { useState } from 'react';
import { Trash2, UserMinus, AlertTriangle, Loader2 } from 'lucide-react';
import { adminService } from '../../services/api/admin.api';
import { User } from '../../types/api.types';

interface UserDeleteModuleProps {
    users: User[];
    isLoading: boolean;
    onDeleted: () => void;
}

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
            <div className="bg-white rounded-2xl shadow-sm flex justify-center items-center h-44">
                <Loader2 className="animate-spin text-blue-500" size={26} />
            </div>
        );
    }

    const filteredUsers = users.filter(user =>
        user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {/* Section header */}
            <div className="px-5 py-3.5 flex items-center justify-between gap-3 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 bg-red-50">
                        <UserMinus size={14} className="text-red-500" />
                    </div>
                    <p className="text-sm text-gray-700">Eliminar usuario</p>
                </div>
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Buscar usuario…"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="text-xs border border-gray-200 rounded-lg px-3 py-2 w-full sm:w-56 outline-none focus:border-[#447ECA] transition-colors bg-white placeholder:text-gray-400"
                    />
                </div>
            </div>

            <div className="p-5">
                {/* Warning banner */}
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl mb-4 text-xs bg-orange-50 border border-orange-200">
                    <AlertTriangle size={13} className="text-orange-500 flex-shrink-0" />
                    <span className="text-orange-800 font-medium">Esta acción es permanente y no se puede revertir.</span>
                </div>

                {errorMessage && (
                    <div className="rounded-xl border border-red-200 bg-red-50 text-red-700 text-xs font-semibold p-3 mb-4">
                        {errorMessage}
                    </div>
                )}

                <div className="space-y-2">
                    {filteredUsers.length === 0 ? (
                        <p className="text-center py-4 text-xs text-gray-400 font-medium">No se encontraron usuarios.</p>
                    ) : (
                        filteredUsers.map(user => {
                            const isConfirming = confirmingId === user.id;
                            const isDeleting   = deletingId   === user.id;

                            return (
                                <div
                                    key={user.id}
                                    className="flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors"
                                    style={{
                                        borderColor: isConfirming ? '#FECACA' : '#F3F4F6',
                                        backgroundColor: isConfirming ? '#FFF5F5' : 'white',
                                    }}
                                >
                                    {/* Avatar */}
                                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] text-white flex-shrink-0 ${user.role === 'ADMIN' ? 'bg-[#447ECA]' : 'bg-gray-400'}`}>
                                        {user.email.split('@')[0][0].toUpperCase()}
                                    </div>

                                    {/* Name */}
                                    <span className="text-sm text-gray-700 flex-1 min-w-0 truncate">{user.email.split('@')[0]}</span>

                                    {/* Role pill */}
                                    <span
                                        className="text-[10px] px-2 py-0.5 rounded-full flex-shrink-0 hidden sm:block"
                                        style={user.role === 'ADMIN'
                                            ? { backgroundColor: '#EFF6FF', color: '#447ECA' }
                                            : { backgroundColor: '#F3F4F6', color: '#6B7280' }
                                        }
                                    >
                                        {user.role === 'ADMIN' ? 'admin' : 'user'}
                                    </span>

                                    {/* Actions */}
                                    {isDeleting ? (
                                        <span className="flex items-center gap-1.5 text-xs text-red-400 flex-shrink-0">
                                            <span className="w-3 h-3 border-2 border-red-300 border-t-red-500 rounded-full animate-spin" />
                                            Eliminando…
                                        </span>
                                    ) : isConfirming ? (
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            <span className="text-xs text-red-500 font-medium">¿Confirmar?</span>
                                            <button
                                                onClick={() => handleDelete(user.id)}
                                                className="px-3 py-1.5 rounded-lg text-xs text-white bg-red-500 hover:bg-red-600 transition-colors"
                                            >
                                                Sí, eliminar
                                            </button>
                                            <button
                                                onClick={() => setConfirmingId(null)}
                                                className="px-3 py-1.5 rounded-lg text-xs border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
                                            >
                                                Cancelar
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => setConfirmingId(user.id)}
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border border-red-200 text-red-500 hover:bg-red-50 transition-colors flex-shrink-0"
                                        >
                                            <Trash2 size={11} /> Eliminar
                                        </button>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};
