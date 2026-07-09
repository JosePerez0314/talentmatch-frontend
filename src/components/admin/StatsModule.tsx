import React, { useState, useEffect } from 'react';
import { Activity, Loader2 } from 'lucide-react';
import { adminService } from '../../services/api/admin.api';
import { StatCard } from './StatCard';
import { StatItem } from '../../types/admin.types';

export const StatsModule: React.FC = () => {
    const [stats, setStats] = useState<StatItem[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setIsLoading(true);
                const data = await adminService.getStats();

                // Si la API devuelve el objeto con las propiedades, las mapeamos al array que la UI necesita
                if (data && !Array.isArray(data)) {
                    const formattedStats: StatItem[] = [
                        { id: 1, label: 'Total usuarios', count: data.totalUsers || 0, icon: 'Users', type: 'azul' },
                        { id: 2, label: 'Administradores', count: data.admins || 0, icon: 'Shield', type: 'morado' },
                        { id: 3, label: 'Usuarios', count: data.standardUsers || 0, icon: 'User', type: 'verde' },
                        { id: 4, label: 'Posiciones', count: data.positions || 0, icon: 'Briefcase', type: 'amarillo' },
                        { id: 5, label: 'Vacantes totales', count: data.totalVacancies || 0, icon: 'FileText', type: 'rojo' },
                        { id: 6, label: 'Vacantes activas', count: data.activeVacancies || 0, icon: 'CheckCircle2', type: 'verde' },
                        { id: 7, label: 'Candidatos', count: data.candidates || 0, icon: 'Users', type: 'azul' },
                        { id: 8, label: 'Evaluaciones', count: data.evaluations || 0, icon: 'BarChart3', type: 'morado' },
                    ];
                    setStats(formattedStats);
                } else {
                    setStats(Array.isArray(data) ? data : []);
                }
            } catch (error) {
                console.error("Error al cargar las estadísticas:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (isLoading) {
        return (
            <div className="bg-white rounded-[24px] border border-gray-100 p-8 shadow-sm flex justify-center items-center h-44">
                <Loader2 className="animate-spin text-blue-500" size={26} />
            </div>
        );
    }

    return (
        <div className="bg-white rounded-[24px] border border-gray-100 p-8 shadow-sm w-full">
            {/* Cabecera del módulo */}
            <div className="flex items-center gap-2.5 mb-6">
                <div className="p-1.5 bg-blue-50 text-blue-500 rounded-lg">
                    <Activity size={16} strokeWidth={2.5} />
                </div>
                <h2 className="text-sm font-bold text-gray-700 tracking-tight">Estadísticas del sistema</h2>
            </div>

            {/* Grid adaptativo exacto de 4 columnas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {stats.map((stat) => (
                    <StatCard
                        key={stat.id}
                        {...stat}
                    />
                ))}
            </div>
        </div>
    );
};