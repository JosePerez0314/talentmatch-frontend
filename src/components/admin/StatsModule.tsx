import React from 'react';
import { Activity } from 'lucide-react';
import { StatCard } from './StatCard';
import { StatItem } from '../../types/admin.types';

// Datos de prueba temporales basados estrictamente en las imágenes de Figma
const systemStats: StatItem[] = [
    { id: 1, label: 'Total usuarios', count: 5, icon: 'Users', type: 'azul' },
    { id: 2, label: 'Administradores', count: 2, icon: 'Shield', type: 'morado' },
    { id: 3, label: 'Usuarios', count: 3, icon: 'UserCheck', type: 'verde' },
    { id: 4, label: 'Posiciones', count: 7, icon: 'Briefcase', type: 'amarillo' },
    { id: 5, label: 'Vacantes totales', count: 8, icon: 'FileText', type: 'rojo' },
    { id: 6, label: 'Vacantes activas', count: 4, icon: 'TrendingUp', type: 'verde' },
    { id: 7, label: 'Candidatos', count: 14, icon: 'FileUser', type: 'azul' },
    { id: 8, label: 'Evaluaciones', count: 3, icon: 'Activity', type: 'morado' },
];

export const StatsModule: React.FC = () => {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
                <Activity size={16} className="text-blue-500" />
                <h2 className="text-sm font-semibold text-gray-700">Estadísticas del sistema</h2>
            </div>

            {/* Grid Responsivo Automatizado */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {systemStats.map((stat) => (
                    <StatCard key={stat.id} {...stat} />
                ))}
            </div>
        </div>
    );
};