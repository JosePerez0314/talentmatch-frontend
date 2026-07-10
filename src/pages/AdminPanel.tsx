import React, { useState, useEffect } from 'react';
import { Shield } from 'lucide-react';
import { StatsModule } from '../components/admin/StatsModule';
import { UserTableModule } from '../components/admin/UserTableModule';
import { RoleUpdateModule } from '../components/admin/RoleUpdateModule';
import { UserDeleteModule } from '../components/admin/UserDeleteModule';

const AdminPanel: React.FC = () => {
    const [isLoading, setIsLoading] = useState<boolean>(true);

    // Mantenemos la lógica de carga intacta
    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 750);
        return () => clearTimeout(timer);
    }, []);

    if (isLoading) {
        return (
            <div className="p-12 space-y-6 bg-[#f8fafc] min-h-screen animate-pulse">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3 w-full">
                        <div className="w-10 h-10 bg-gray-200 rounded-xl"></div>
                        <div className="space-y-2 w-1/4">
                            <div className="h-5 bg-gray-200 rounded w-full"></div>
                            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                        </div>
                    </div>
                    <div className="w-20 h-6 bg-gray-200 rounded-full"></div>
                </div>
                <div className="h-44 bg-gray-200 rounded-2xl w-full"></div>
                <div className="h-72 bg-gray-200 rounded-2xl w-full"></div>
            </div>
        );
    }

    return (
        <div className="p-12 bg-[#f8fafc] min-h-screen space-y-6 overflow-y-auto">
            {/* Encabezado Principal */}
            <div className="flex items-center justify-between pb-2">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl shadow-sm border border-blue-100/50">
                        <Shield size={22} strokeWidth={2} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Panel de Administración</h1>
                        <p className="text-xs text-gray-400 font-medium mt-0.5">
                            Sesión: <span className="font-semibold text-gray-500">admin</span> · Solo visible para administradores
                        </p>
                    </div>
                </div>

                {/* Píldora del rol en la esquina derecha del Figma */}
                <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-semibold border border-blue-100/80 shadow-sm">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span>
                    admin
                </div>
            </div>

            {/* Inyección secuencial en cascada vertical (Full Width) */}
            <div className="space-y-6">
                <StatsModule />
                <UserTableModule />
                <RoleUpdateModule />
                <UserDeleteModule />
            </div>
        </div>
    );
};

export default AdminPanel;