import React from 'react';
import * as Icons from 'lucide-react';
import { StatItem } from '../../types/admin.types';

const colorStyles = {
    azul: { bg: 'bg-[#f0f6ff]/80', text: 'text-blue-600', iconBg: 'bg-blue-100/70' },
    morado: { bg: 'bg-[#faf5ff]/80', text: 'text-purple-600', iconBg: 'bg-purple-100/70' },
    verde: { bg: 'bg-[#f0fcf4]/80', text: 'text-emerald-600', iconBg: 'bg-emerald-100/70' },
    amarillo: { bg: 'bg-[#fffbeb]/80', text: 'text-amber-600', iconBg: 'bg-amber-100/70' },
    rojo: { bg: 'bg-[#fff2f3]/80', text: 'text-rose-600', iconBg: 'bg-rose-100/70' },
};

export const StatCard: React.FC<StatItem> = ({ label, count, icon, type }) => {
    // @ts-ignore
    const IconComponent = Icons[icon] || Icons.HelpCircle;
    const style = colorStyles[type] || colorStyles.azul;

    return (
        <div className={`flex items-center p-4 rounded-xl border border-gray-100/60 ${style.bg} transition-all`}>
            <div className={`p-3 rounded-xl mr-4 ${style.iconBg} ${style.text} flex items-center justify-center shadow-sm shrink-0`}>
                <IconComponent size={20} strokeWidth={2.5} />
            </div>

            <div className="flex flex-col min-w-0">
                <span className={`text-2xl font-bold ${style.text} block leading-none mb-1 tracking-tight`}>
                    {count}
                </span>
                <p className="text-[11px] font-semibold text-gray-400 whitespace-nowrap tracking-wide">
                    {label}
                </p>
            </div>
        </div>
    );
};