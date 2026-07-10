import React, { useState, useEffect } from 'react';
import { Trash2, UserMinus, AlertTriangle } from 'lucide-react';
import { adminService } from '../../services/api/admin.api';
import { AdminUser } from '../../types/admin.types';

export const UserDeleteModule: React.FC = () => {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>(''); // Filtro visual reactivo

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const data = await adminService.getUsers(1, 50);
                setUsers(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Error cargando usuarios:", error);
            }
        };
        fetchUsers();
    }, []);

    // Filtrado reactivo en UI
    const filteredUsers = (Array.isArray(users) ? users : []).filter(user =>
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

            {/* Lista de usuarios con diseño Figma */}
            <div className="space-y-2.5">
                {filteredUsers.length === 0 ? (
                    <p className="text-center py-4 text-xs text-gray-400 font-medium">No se encontraron usuarios.</p>
                ) : (
                    filteredUsers.map((user: AdminUser) => (
                        <div
                            key={user.id}
                            className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-gray-100/70 bg-white hover:shadow-sm transition-all gap-4"
                        >
                            {/* Información e Iniciales */}
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-sm uppercase shrink-0">
                                    {user.username?.substring(0, 2) || 'US'}
                                </div>
                                <div>
                                    <p className="font-bold text-gray-700 text-xs tracking-tight">{user.username}</p>
                                    <p className="text-[11px] text-gray-400 font-medium mt-0.5">{user.email}</p>
                                </div>
                            </div>

                            {/* Badge del rol actual + Botón eliminar exacto del Figma */}
                            <div className="flex items-center gap-4 justify-end shrink-0">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${user.role === 'admin'
                                    ? 'bg-blue-50 text-blue-600 border border-blue-100/50'
                                    : 'bg-gray-50 text-gray-500 border border-gray-100'
                                    }`}
                                >
                                    {user.role}
                                </span>

                                <button
                                    type="button"
                                    aria-label="Eliminar usuario"
                                    className="flex items-center gap-1.5 px-3 py-1.5 border border-red-200 text-red-600 bg-red-50/50 hover:bg-red-50 rounded-xl text-xs font-bold transition-all shadow-sm"
                                >
                                    <Trash2 size={13} strokeWidth={2.5} />
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};