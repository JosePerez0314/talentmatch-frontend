import React from 'react';
import { Users, Search } from 'lucide-react';
import { AdminUser } from '../../types/admin.types';

// Datos de prueba temporales basados exactamente en la imagen de Figma
export const mockUsers: AdminUser[] = [
    { id: '1', username: 'admin', email: 'admin@acmecorp.com', role: 'admin', created: '01/01/2026', lastAccess: 'Hoy', avatar: 'A' },
    { id: '2', username: 'usuario', email: 'usuario@acmecorp.com', role: 'user', created: '15/03/2026', lastAccess: 'Hoy', avatar: 'U' },
    { id: '3', username: 'rrhh_manager', email: 'rrhh@acmecorp.com', role: 'user', created: '20/02/2026', lastAccess: '28/06/2026', avatar: 'R' },
    { id: '4', username: 'recruiter_01', email: 'rec01@acmecorp.com', role: 'user', created: '10/04/2026', lastAccess: '27/06/2026', avatar: 'R' },
    { id: '5', username: 'director_ops', email: 'ops@acmecorp.com', role: 'admin', created: '01/01/2026', lastAccess: '25/06/2026', avatar: 'D' },
];

export const UserTableModule: React.FC = () => {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            {/* Cabecera del módulo con Buscador */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div className="flex items-center gap-2">
                    <Users size={16} className="text-emerald-500" />
                    <h2 className="text-sm font-semibold text-gray-700">Todos los usuarios</h2>
                </div>
                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar usuario..."
                        className="w-full pl-9 pr-4 py-1.5 text-sm bg-gray-50/40 border border-gray-200/80 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500/40 transition-all placeholder:text-gray-400"
                    />
                </div>
            </div>

            {/* Tabla Responsiva */}
            <div className="overflow-x-auto-scrolling overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-gray-100 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                            <th className="pb-3 font-medium">Usuario</th>
                            <th className="pb-3 font-medium">Email</th>
                            <th className="pb-3 font-medium">Rol</th>
                            <th className="pb-3 font-medium">Creado</th>
                            <th className="pb-3 font-medium">Último acceso</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 text-sm text-gray-600">
                        {mockUsers.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50/30 transition-colors">
                                {/* Columna Usuario con Avatar circular */}
                                <td className="py-3 flex items-center gap-3 font-medium text-gray-800">
                                    <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                                        {user.avatar}
                                    </div>
                                    <span className="text-xs sm:text-sm">{user.username}</span>
                                </td>

                                {/* Columna Email */}
                                <td className="py-3 text-xs sm:text-sm text-gray-500">{user.email}</td>

                                {/* Columna Rol Badges */}
                                <td className="py-3">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold tracking-wide lowercase ${user.role === 'admin' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-500'
                                        }`}>
                                        {user.role}
                                    </span>
                                </td>

                                {/* Columna Creado */}
                                <td className="py-3 text-gray-400 font-mono text-xs">{user.created}</td>

                                {/* Columna Último Acceso */}
                                <td className="py-3 text-xs sm:text-sm text-gray-500">{user.lastAccess}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};