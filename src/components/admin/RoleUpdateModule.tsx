import React, { useState, useEffect } from 'react';
import { UserCheck, Loader2 } from 'lucide-react';
import { adminService } from '../../services/api/admin.api';
import { User, UserRole } from '../../types/api.types';

const getInitials = (name?: string): string =>
    (name ?? '').trim().slice(0, 2).toUpperCase() || 'US';

export const RoleUpdateModule: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [currentRoles, setCurrentRoles] = useState<Record<string, UserRole>>({});
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isSaving, setIsSaving] = useState<Record<string, boolean>>({});
    const [searchTerm, setSearchTerm] = useState<string>('');

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setIsLoading(true);
                const data = await adminService.getUsers(1, 50);
                const list = data.users ?? [];
                setUsers(list);

                const initialRoles: Record<string, UserRole> = {};
                for (const u of list) initialRoles[u.id] = u.role;
                setCurrentRoles(initialRoles);
            } catch (error) {
                console.error("Error al cargar usuarios:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchUsers();
    }, []);

    const handleRoleChange = (userId: string, newRole: UserRole) => {
        setCurrentRoles((prev) => ({ ...prev, [userId]: newRole }));
    };

    const handleSave = async (userId: string) => {
        try {
            setIsSaving((prev) => ({ ...prev, [userId]: true }));
            await adminService.updateRole(userId, currentRoles[userId]);
        } catch (error) {
            console.error("Error al actualizar:", error);
        } finally {
            setIsSaving((prev) => ({ ...prev, [userId]: false }));
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
                    <div className="p-1.5 bg-amber-50 text-amber-500 rounded-lg">
                        <UserCheck size={16} strokeWidth={2.5} />
                    </div>
                    <h2 className="text-sm font-bold text-gray-700 tracking-tight">Actualizar rol de usuario</h2>
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

            {/* Listado de filas alineadas */}
            <div className="space-y-2.5">
                {filteredUsers.length === 0 ? (
                    <p className="text-center py-4 text-xs text-gray-400 font-medium">No se encontraron usuarios.</p>
                ) : (
                    filteredUsers.map((user) => {
                        const isChanged = currentRoles[user.id] !== user.role;
                        const saving = isSaving[user.id];

                        return (
                            <div
                                key={user.id}
                                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-gray-100/70 bg-white hover:shadow-sm transition-all gap-4"
                            >
                                <div className="flex items-center gap-3 sm:w-1/3 min-w-[200px]">
                                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-sm uppercase shrink-0">
                                        {getInitials(user.username)}
                                    </div>
                                    <h4 className="text-xs font-bold text-gray-700 tracking-tight">{user.username}</h4>
                                </div>

                                <div className="flex flex-1 flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <p className="text-xs text-gray-400 font-medium">{user.email}</p>

                                    <div className="flex items-center gap-2.5 justify-end shrink-0">
                                        <select
                                            aria-label="Seleccionar nuevo rol"
                                            value={currentRoles[user.id]}
                                            onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                                            className="bg-gray-50/50 border border-gray-200 text-gray-600 rounded-xl px-3 py-1.5 text-xs font-bold focus:outline-none focus:border-blue-300 cursor-pointer"
                                        >
                                            <option value="ADMIN">Admin</option>
                                            <option value="USER">Usuario</option>
                                        </select>

                                        <button
                                            disabled={!isChanged || saving}
                                            onClick={() => handleSave(user.id)}
                                            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${isChanged
                                                    ? 'bg-[#f5d6b3] text-amber-950 hover:brightness-95 cursor-pointer shadow-sm'
                                                    : 'bg-gray-50 text-gray-300 border border-gray-100 cursor-not-allowed'
                                                }`}
                                        >
                                            {saving ? 'Guardando...' : 'Guardar'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};
