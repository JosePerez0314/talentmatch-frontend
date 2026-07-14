import React, { useState, useEffect } from 'react';
import { Activity, Loader2 } from 'lucide-react';
import { adminService, AdminStats } from '../../services/api/admin.api';
import { StatCard } from './StatCard';
import { StatItem } from '../../types/admin.types';

// GET /admin/stats returns 6 global counters (api-documentation §6).
const buildStatItems = (data: AdminStats): StatItem[] => [
    { id: 1, label: 'Total usuarios',    count: data.usersCount,      icon: 'Users',        type: 'azul'     },
    { id: 2, label: 'Candidatos',        count: data.candidatesCount, icon: 'UserCheck',    type: 'morado'   },
    { id: 3, label: 'Posiciones',        count: data.positionsCount,  icon: 'Briefcase',    type: 'amarillo' },
    { id: 4, label: 'Vacantes totales',  count: data.vacanciesCount,  icon: 'FileText',     type: 'rojo'     },
    { id: 5, label: 'Vacantes activas',  count: data.activeVacancies, icon: 'CheckCircle2', type: 'verde'    },
    { id: 6, label: 'Vacantes cerradas', count: data.closedVacancies, icon: 'XCircle',      type: 'rojo'     },
];

export const StatsModule: React.FC = () => {
    const [stats, setStats]             = useState<StatItem[]>([]);
    const [isLoading, setIsLoading]     = useState<boolean>(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            try {
                setIsLoading(true);
                setErrorMessage(null);
                const data = await adminService.getStats();
                setStats(buildStatItems(data));
            } catch (error) {
                console.error("Error al cargar las estadísticas:", error);
                setErrorMessage("No se pudieron cargar las estadísticas del sistema.");
            } finally {
                setIsLoading(false);
            }
        })();
    }, []);

    return (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {/* Section header */}
            <div className="px-5 py-3.5 flex items-center gap-2.5 border-b border-gray-100">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 bg-[#EFF6FF]">
                    <Activity size={14} className="text-[#447ECA]" />
                </div>
                <p className="text-sm text-gray-700">Estadísticas del sistema</p>
            </div>

            <div className="p-5">
                {isLoading ? (
                    <div className="flex justify-center items-center h-28">
                        <Loader2 className="animate-spin text-[#447ECA]" size={24} />
                    </div>
                ) : errorMessage ? (
                    <div className="rounded-xl border border-red-200 bg-red-50 text-red-700 text-xs font-semibold p-3">
                        {errorMessage}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {stats.map(stat => <StatCard key={stat.id} {...stat} />)}
                    </div>
                )}
            </div>
        </div>
    );
};
