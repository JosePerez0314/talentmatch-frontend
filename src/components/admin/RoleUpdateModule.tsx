import React, { useEffect, useState } from 'react';
import { UserCog, CheckCircle, Loader2, ChevronDown } from 'lucide-react';
import { adminService } from '../../services/api/admin.api';
import { User, UserRole } from '../../types/api.types';

interface RoleUpdateModuleProps {
    users: User[];
    isLoading: boolean;
    onSaved: () => void;
}

const getInitials = (name?: string): string =>
    (name ?? '').trim().slice(0, 2).toUpperCase() || 'US';

export const RoleUpdateModule: React.FC<RoleUpdateModuleProps> = ({ users, isLoading, onSaved }) => {
    const [pendingRoles, setPendingRoles] = useState<Record<string, UserRole>>({});
    const [savingId, setSavingId]         = useState<string | null>(null);
    const [savedId, setSavedId]           = useState<string | null>(null);
    const [searchTerm, setSearchTerm]     = useState<string>('');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        const initial = users.reduce<Record<string, UserRole>>((acc, u) => {
            acc[u.id] = u.role;
            return acc;
        }, {});
        setPendingRoles(initial);
    }, [users]);

    const handleSave = async (userId: string) => {
        try {
            setSavingId(userId);
            setErrorMessage(null);
            await adminService.updateRole(userId, pendingRoles[userId]);
            setSavingId(null);
            setSavedId(userId);
            setTimeout(() => setSavedId(null), 1800);
            onSaved();
        } catch (error) {
            console.error("Error al actualizar rol:", error);
            setErrorMessage("No se pudo actualizar el rol. Intenta nuevamente.");
            setSavingId(null);
        }
    };

    if (isLoading) {
        return (
            <div className="bg-white rounded-2xl shadow-sm flex justify-center items-center h-44">
                <Loader2 className="animate-spin text-[#447ECA]" size={24} />
            </div>
        );
    }

    const filteredUsers = users.filter(u =>
        u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {/* Section header */}
            <div className="px-5 py-3.5 flex items-center justify-between gap-3 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 bg-amber-50">
                        <UserCog size={14} className="text-amber-600" />
                    </div>
                    <p className="text-sm text-gray-700">Actualizar rol de usuario</p>
                </div>
                <input
                    type="text"
                    placeholder="Buscar usuario…"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="text-xs border border-gray-200 rounded-lg px-3 py-2 w-full sm:w-56 outline-none focus:border-[#447ECA] transition-colors bg-white placeholder:text-gray-400"
                />
            </div>

            <div className="p-5">
                {errorMessage && (
                    <div className="rounded-xl border border-red-200 bg-red-50 text-red-700 text-xs font-semibold p-3 mb-4">
                        {errorMessage}
                    </div>
                )}

                <div className="space-y-2">
                    {filteredUsers.length === 0 ? (
                        <p className="text-center py-4 text-xs text-gray-400">Sin resultados</p>
                    ) : filteredUsers.map(u => {
                        const pending    = pendingRoles[u.id] ?? u.role;
                        const hasPending = pending !== u.role;
                        const isSaving   = savingId === u.id;
                        const justSaved  = savedId  === u.id;

                        return (
                            <div
                                key={u.id}
                                className="flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors"
                                style={{
                                    borderColor: hasPending ? '#FCD34D' : '#F3F4F6',
                                    backgroundColor: hasPending ? '#FFFBEB' : 'white',
                                }}
                            >
                                {/* Avatar */}
                                <div
                                    className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] text-white flex-shrink-0"
                                    style={{ backgroundColor: u.role === 'ADMIN' ? '#447ECA' : '#6B7280' }}
                                >
                                    {getInitials(u.username)}
                                </div>

                                <span className="text-sm text-gray-700 flex-1 min-w-0 truncate">{u.username}</span>
                                <span className="text-xs text-gray-400 hidden sm:block flex-shrink-0 truncate max-w-[160px]">{u.email}</span>

                                {/* Role select */}
                                <div className="relative flex-shrink-0">
                                    <select
                                        value={pending}
                                        onChange={e => setPendingRoles(prev => ({ ...prev, [u.id]: e.target.value as UserRole }))}
                                        disabled={isSaving}
                                        className="appearance-none pl-2.5 pr-7 py-1.5 border border-gray-200 rounded-lg text-xs outline-none focus:border-[#447ECA] bg-white disabled:opacity-50 transition-colors"
                                    >
                                        <option value="ADMIN">admin</option>
                                        <option value="USER">user</option>
                                    </select>
                                    <ChevronDown size={10} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                </div>

                                {/* Save button */}
                                <button
                                    onClick={() => handleSave(u.id)}
                                    disabled={!hasPending || isSaving}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
                                    style={{ backgroundColor: justSaved ? '#16A34A' : '#D97706' }}
                                >
                                    {isSaving
                                        ? <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                        : justSaved
                                            ? <><CheckCircle size={11} /> Guardado</>
                                            : 'Guardar'
                                    }
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
