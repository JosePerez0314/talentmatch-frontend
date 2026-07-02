// src/components/admin/UserDeleteModule.tsx
import React from 'react';
import { UserX, Search, AlertTriangle, Trash2 } from 'lucide-react';
import { mockUsers } from './UserTableModule';

export const UserDeleteModule: React.FC = () => {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            {/* Cabecera del módulo con Buscador */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                <div className="flex items-center gap-2">
                    <UserX size={16} className="text-rose-500" />
                    <h2 className="text-sm font-semibold text-gray-700">Eliminar usuario</h2>
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

            {/* Banner de Advertencia Naranja (Criterio de aceptación) */}
            <div className="bg-[#fffbeb] border border-amber-200 rounded-xl p-3 flex items-center gap-3 mb-4">
                <AlertTriangle size={15} className="text-amber-600 flex-shrink-0" />
                <p className="text-xs font-medium text-amber-900">Esta acción es permanente y no se puede revertir.</p>
            </div>

            {/* Lista de usuarios con botón destructivo */}
            <div className="space-y-3">
                {mockUsers.map((user) => (
                    <div
                        key={user.id}
                        className="flex items-center justify-between p-4 rounded-xl border border-gray-100/70 bg-white hover:shadow-sm transition-all"
                    >
                        {/* Usuario */}
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-500 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                                {user.avatar}
                            </div>
                            <h4 className="text-xs sm:text-sm font-medium text-gray-800">{user.username}</h4>
                        </div>

                        {/* Estado de Rol y Botón Eliminar Rojo */}
                        <div className="flex items-center gap-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold tracking-wide lowercase ${user.role === 'admin' ? 'bg-blue-50 text-blue-500' : 'bg-gray-100 text-gray-400'
                                }`}>
                                {user.role}
                            </span>
                            <button className="flex items-center gap-1.5 px-3 py-1.5 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-sm">
                                <Trash2 size={13} />
                                <span>Eliminar</span>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
