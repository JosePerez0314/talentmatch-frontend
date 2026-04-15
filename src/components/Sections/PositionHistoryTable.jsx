import React, { useMemo } from "react";
import { Icons } from "../../assets/icons/index.js";

const PositionHistoryTable = ({ data = [] }) => {

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        });
    };

    const totalPositions = useMemo(() => data.length, [data]);

    return (
        <div className="flex flex-col w-full bg-white">
            <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-white sticky top-0 z-10">
                <span className="text-gray-400 font-black text-[11px] uppercase tracking-[0.2em]">
                    Puesto / Rol solicitado
                </span>

                <div className="flex items-center gap-2 bg-[#DCF9FF] text-[#447ECA] px-4 py-2 rounded-xl">
                    <img
                        src={Icons.stats.vacantCreateBlue}
                        alt="Positions"
                        className="w-5 h-5"
                        style={{ filter: "invert(42%) sepia(85%) saturate(1212%) hue-rotate(189deg) brightness(91%) contrast(85%)" }}
                    />
                    <span className="font-bold text-sm tracking-tight">
                        {totalPositions} Posiciones
                    </span>
                </div>
            </div>

            <div className="divide-y divide-gray-50 overflow-y-auto max-h-[60vh] custom-scrollbar">
                {data.map((position) => (
                    <PositionRow
                        key={position.id}
                        position={position}
                        formatDate={formatDate}
                    />
                ))}
            </div>
        </div>
    );
};

const PositionRow = ({ position, formatDate }) => {
    const { role, yearsOfExperience, education, createdAt } = position;

    return (
        <div className="px-8 py-5 flex justify-between items-center hover:bg-[#F9FBFF] transition-colors group">
            <div className="flex items-center gap-5">
                <div className="w-10 h-10 bg-[#F0F7FF] rounded-xl flex items-center justify-center group-hover:bg-white transition-colors">
                    <img
                        src={Icons.stats.vacantCreateBlue}
                        alt="Job"
                        className="w-5 h-5 object-contain opacity-70"
                    />
                </div>

                <div className="flex flex-col text-left">
                    <p className="font-bold text-gray-700 text-[15px] mb-0.5 leading-tight uppercase tracking-tight">
                        {role || "Puesto sin definir"}
                    </p>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                        {yearsOfExperience} {yearsOfExperience === 1 ? 'Año' : 'Años'} exp. · {education || 'Cualquier formación'}
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-10">
                <span className="text-gray-400 text-xs font-black uppercase">
                    {formatDate(createdAt)}
                </span>

                <button
                    className="text-[#447ECA] hover:scale-110 transition-transform p-2 cursor-pointer bg-gray-50 rounded-lg group-hover:bg-white"
                    title="Ver detalles de la posición"
                >
                    <img
                        src={Icons.stats.eyeHistoryGray}
                        alt="Ver"
                        className="w-5 h-5"
                        style={{ filter: "invert(42%) sepia(85%) saturate(1212%) hue-rotate(189deg) brightness(91%) contrast(85%)" }}
                    />
                </button>
            </div>
        </div>
    );
};

export default PositionHistoryTable;