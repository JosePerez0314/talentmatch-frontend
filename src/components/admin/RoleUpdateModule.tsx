import React, { useState } from 'react';
import { UserCheck, Search } from 'lucide-react';
import { mockUsers } from './UserTableModule';

export const RoleUpdateModule: React.FC = () => {
    const [currentRoles, setCurrentRoles] = useState<Record<string, 'admin' | 'user'>>(
        mockUsers.reduce((acc, user) => ({ ...acc, [user.id]: user.role }), {})
    );

    const handleRoleChange = (userId: string, newRole: 'admin' | 'user') => {
        setCurrentRoles((prev) => ({ ...prev, [userId]: newRole }));
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            {/* Cabecera con Buscador */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div className="flex items-center gap-2">
                    <UserCheck size={16} className="text-amber-500" />
                    <h2 className="text-sm font-semibold text-gray-700">Actualizar rol de usuario</h2>
                </div>
                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar usuario..."
                        className="w-full pl-9 pr-4 py-1.5 text-sm bg-gray-50/40 border border-gray-200/80 rounded-xl focus:outline-none"
                    />
                </div>
            </div>

            {/* Lista de Filas de Usuarios */}
            <div className="space-y-3">
                {mockUsers.map((user) => {
                    const isButtonEnabled = currentRoles[user.id] !== user.role;

                    return (
                        <div
                            key={user.id}
                            className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-gray-100/70 bg-white hover:shadow-sm transition-all gap-4"
                        >
                            {/* Bloque Izquierdo: Avatar y Nombre únicamente */}
                            <div className="flex items-center gap-3 min-w-[180px]">
                                <div className="w-8 h-8 rounded-full bg-slate-500 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                                    {user.avatar}
                                </div>
                                <h4 className="text-xs sm:text-sm font-medium text-gray-800">{user.username}</h4>
                            </div>

                            {/* Bloque Derecho: Correo al lado, Select y Botón Guardar */}
                            <div className="flex flex-1 flex-col sm:flex-row sm:items-center justify-end gap-3 sm:gap-8 w-full sm:w-auto">
                                {/* El correo electrónico ahora se renderiza aquí de forma alineada en horizontal */}
                                <p className="text-xs sm:text-sm text-gray-400 font-normal tracking-normal text-right sm:text-left">
                                    {user.email}
                                </p>

                                <div className="flex items-center gap-3 justify-end">
                                    <select
                                        aria-label={`Cambiar rol para el usuario ${user.username}`}
                                        value={currentRoles[user.id]}
                                        onChange={(e) => handleRoleChange(user.id, e.target.value as 'admin' | 'user')}
                                        className="bg-white border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-medium text-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500/40 cursor-pointer"
                                    >
                                        <option value="admin">admin</option>
                                        <option value="user">user</option>
                                    </select>

                                    <button
                                        disabled={!isButtonEnabled}
                                        className={`px-4 py-1.5 bg-[#f5d6b3] rounded-xl text-xs font-semibold text-amber-950 transition-all ${isButtonEnabled
                                            ? 'opacity-100 hover:brightness-95 cursor-pointer shadow-sm'
                                            : 'opacity-40 cursor-not-allowed text-amber-900/60'
                                            }`}
                                    >
                                        Guardar
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};