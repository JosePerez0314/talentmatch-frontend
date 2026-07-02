import React from 'react';
import * as Icons from 'lucide-react';
import { StatItem } from '../../types/admin.types';

// Mapeo exacto de los colores solicitados
const colorStyles = {
    azul: { bg: 'bg-[#f0f6ff]', text: 'text-blue-600', iconBg: 'bg-blue-100/70' },
    morado: { bg: 'bg-[#faf5ff]', text: 'text-purple-600', iconBg: 'bg-purple-100/70' },
    verde: { bg: 'bg-[#f0fcf4]', text: 'text-emerald-600', iconBg: 'bg-emerald-100/70' },
    amarillo: { bg: 'bg-[#fffbeb]', text: 'text-amber-600', iconBg: 'bg-amber-100/70' },
    rojo: { bg: 'bg-[#fff2f3]', text: 'text-rose-600', iconBg: 'bg-rose-100/70' },
};

export const StatCard: React.FC<StatItem> = ({ label, count, icon, type }) => {
    // Recuperamos el icono dinámicamente de Lucide de forma segura
    // @ts-ignore
    const IconComponent = Icons[icon] || Icons.HelpCircle;
    const style = colorStyles[type] || colorStyles.azul;

    return (
        <div className={`flex items-center p-4 rounded-xl border border-gray-100/80 ${style.bg} transition-all shadow-sm`}>
            <div className={`p-3 rounded-xl mr-4 ${style.iconBg} ${style.text}`}>
                <IconComponent size={20} strokeWidth={2.5} />
            </div>
            <div>
                <span className="text-2xl font-bold text-gray-800 block leading-tight">{count}</span>
                <p className="text-xs font-medium text-gray-500 whitespace-nowrap">{label}</p>
            </div>
        </div>
    );
};