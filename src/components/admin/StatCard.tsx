import React from 'react';
import * as Icons from 'lucide-react';
import { StatItem } from '../../types/admin.types';

const colorStyles = {
    azul:    { bg: 'bg-[#EFF6FF]', text: 'text-[#447ECA]', iconBg: 'bg-[#DBEAFE]' },
    morado:  { bg: 'bg-[#F5F3FF]', text: 'text-purple-600', iconBg: 'bg-purple-100' },
    verde:   { bg: 'bg-[#F0FDF4]', text: 'text-emerald-600', iconBg: 'bg-emerald-100' },
    amarillo:{ bg: 'bg-[#FFFBEB]', text: 'text-amber-600',  iconBg: 'bg-amber-100'  },
    rojo:    { bg: 'bg-[#FFF1F2]', text: 'text-rose-600',   iconBg: 'bg-rose-100'   },
};

export const StatCard: React.FC<StatItem> = ({ label, count, icon, type }) => {
    // @ts-ignore
    const IconComponent = Icons[icon] || Icons.HelpCircle;
    const style = colorStyles[type] || colorStyles.azul;

    return (
        <div className={`flex items-center gap-3 p-4 rounded-xl border border-black/5 ${style.bg}`}>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${style.iconBg} ${style.text}`}>
                <IconComponent size={16} strokeWidth={2.5} />
            </div>
            <div>
                <p className={`text-xl leading-none font-semibold ${style.text}`}>{count}</p>
                <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            </div>
        </div>
    );
};
