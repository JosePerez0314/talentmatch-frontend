// src/pages/AdminPanel.tsx
import React, { useState, useEffect } from 'react';
import { Shield } from 'lucide-react';
import { StatsModule } from '../components/admin/StatsModule';
import { UserTableModule } from '../components/admin/UserTableModule';
import { RoleUpdateModule } from '../components/admin/RoleUpdateModule';
import { UserDeleteModule } from '../components/admin/UserDeleteModule';

const AdminPanel: React.FC = () => {
    const [isLoading, setIsLoading] = useState<boolean>(true);

    // Simulación del estado de carga solicitado
    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 750);
        return () => clearTimeout(timer);
    }, []);

    if (isLoading) {
        return (
            <div className="p-6 space-y-6 animate-pulse bg-[#f8fafc] min-h-screen">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                    <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                </div>
                <div className="h-32 bg-gray-200 rounded-2xl w-full"></div>
                <div className="h-64 bg-gray-200 rounded-2xl w-full"></div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-[#f8fafc] min-h-screen space-y-6 overflow-y-auto">
            {/* Encabezado Principal */}
            <div className="flex items-center gap-2 border-b border-gray-100 pb-4">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg shadow-sm">
                    <Shield size={18} />
                </div>
                <div>
                    <h1 className="text-lg font-bold text-gray-800 tracking-tight">Panel de Administración</h1>
                    <p className="text-[11px] text-gray-400 font-normal">
                        Sesión: <span className="font-semibold text-gray-600">admin</span> · Solo visible para administradores
                    </p>
                </div>
            </div>

            {/* Inyección secuencial de los módulos del Frontend */}
            <StatsModule />
            <UserTableModule />
            <RoleUpdateModule />
            <UserDeleteModule />
        </div>
    );
};

export default AdminPanel;