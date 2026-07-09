import React from "react";
import { Briefcase } from "lucide-react";
import ActionDropdown from "./ActionDropdown";

// Interfaz UI — subset estructural del Position del backend.
export interface PositionData {
    id: number | string;
    role: string;
    createdAt?: string;
    departmentName?: string;
    department?: { name: string };
}

interface PositionHistoryTableProps {
    data: PositionData[];
    onDelete: (id: number | string) => void;
    onDuplicate: (id: number | string) => void;
}

interface PositionRowProps {
    position: PositionData;
    formatDate: (dateString: string | undefined) => string;
    onDelete: (id: number | string) => void;
    onDuplicate: (id: number | string) => void;
}

const PositionHistoryTable: React.FC<PositionHistoryTableProps> = ({ data = [], onDelete, onDuplicate }) => {

    const formatDate = (dateString: string | undefined): string => {
        if (!dateString) return "15/03/2026";
        return new Date(dateString).toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        });
    };

    return (
        <div className="flex flex-col w-full bg-white text-left">
            {/* Encabezado */}
            <div className="px-8 py-5 border-b border-gray-100 bg-white grid grid-cols-12 gap-4 items-center select-none">
                <span className="col-span-5 text-gray-400 font-bold text-[11px] uppercase tracking-[0.15em]">
                    Posición
                </span>
                <span className="col-span-4 text-gray-400 font-bold text-[11px] uppercase tracking-[0.15em]">
                    Departamento
                </span>
                <span className="col-span-2 text-gray-400 font-bold text-[11px] uppercase tracking-[0.15em]">
                    Fecha
                </span>
                <span className="col-span-1 text-gray-400 font-bold text-[11px] uppercase tracking-[0.15em] text-right pr-2">
                    Acciones
                </span>
            </div>

            {/* Cuerpo del listado */}
            <div className="divide-y divide-gray-50 overflow-y-auto max-h-[calc(100vh-340px)] custom-scrollbar">
                {data.map((position) => (
                    <PositionRow
                        key={position.id}
                        position={position}
                        formatDate={formatDate}
                        onDelete={onDelete}
                        onDuplicate={onDuplicate}
                    />
                ))}
            </div>
        </div>
    );
};

const PositionRow: React.FC<PositionRowProps> = ({ position, formatDate, onDelete, onDuplicate }) => {
    // extraer nombre de departamento de Backend
    const { id, role, createdAt, departmentName, department } = position;
    const resolvedDepartmentName = department?.name || departmentName || "General";

    return (
        <div className="px-8 py-4 grid grid-cols-12 gap-4 items-center hover:bg-[#F9FBFF] transition-all group">

            {/* Columna 1 Info de la Posicion */}
            <div className="col-span-5 flex items-center gap-4">
                <div className="w-9 h-9 bg-[#EBF3FC] rounded-xl flex items-center justify-center transition-colors shrink-0">
                    <Briefcase size={16} className="text-[#447ECA] opacity-90" />
                </div>
                <div className="flex flex-col min-w-0">
                    <p className="font-medium text-gray-700 text-[14px] leading-tight tracking-tight">
                        {role || "Puesto sin definir"}
                    </p>
                </div>
            </div>

            {/* Columna 2 Píldora del Departamento */}
            <div className="col-span-4 flex justify-start">
                <span className="px-3 py-1 bg-[#f0f0f5] text-gray-500 rounded-full text-xs font-medium tracking-wide">
                    {resolvedDepartmentName}
                </span>
            </div>

            {/* Columna 3 Fecha Estructurada */}
            <div className="col-span-2 flex items-center text-gray-400 text-[14px] font-medium">
                <span>{formatDate(createdAt)}</span>
            </div>

            {/* Columna 4 Dropdown de Acciones */}
            <div className="col-span-1 flex justify-end pr-1">
                <ActionDropdown 
                    onDelete={() => onDelete(id)} 
                    onDuplicate={() => onDuplicate(id)} 
                />
            </div>

        </div>
    );
};

export default PositionHistoryTable;