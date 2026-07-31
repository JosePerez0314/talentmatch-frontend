import React from "react";
import { Briefcase } from "lucide-react";
import ActionDropdown from "./ActionDropdown";

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

const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return "—";
    const d = new Date(dateString);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" });
};

const PositionHistoryTable: React.FC<PositionHistoryTableProps> = ({ data = [], onDelete, onDuplicate }) => {
    return (
        // Contenedor clave para el responsive: Oculta el overflow en X pero permite el scroll de la tabla
        <div className="w-full overflow-x-auto custom-scrollbar">
            {/* min-w-[700px] obliga a la tabla a no aplastar sus columnas en pantallas de 375px */}
            <table className="w-full min-w-[700px]">
                <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/50">
                        <th className="text-left px-5 py-3.5 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Posición</th>
                        <th className="text-left px-5 py-3.5 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Departamento</th>
                        <th className="text-left px-5 py-3.5 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Fecha</th>
                        <th className="px-5 py-3.5 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-right">Acciones</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                    {data.map((position, index) => {
                        const { id, role, createdAt, departmentName, department } = position;
                        const resolvedDept = department?.name || departmentName || "General";
                        
                        // FIX
                        const isNearBottom = index >= data.length - 2 && data.length > 3;

                        return (
                            <tr key={id} className="hover:bg-gray-50/80 transition-colors group">
                                <td className="px-5 py-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-[#DCF9FF]">
                                            <Briefcase size={16} className="text-[#447ECA]" />
                                        </div>
                                        <span className="text-sm font-bold text-gray-900 truncate max-w-[250px]">
                                            {role || "Puesto sin definir"}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-5 py-4">
                                    <span className="text-[11px] font-bold px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 uppercase tracking-wider">
                                        {resolvedDept}
                                    </span>
                                </td>
                                <td className="px-5 py-4 text-sm font-medium text-gray-500">
                                    {formatDate(createdAt)}
                                </td>
                                <td className="px-5 py-4 text-right">
                                    <ActionDropdown
                                        onDelete={() => onDelete(id)}
                                        onDuplicate={() => onDuplicate(id)}
                                        isUpward={isNearBottom}
                                    />
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default PositionHistoryTable;