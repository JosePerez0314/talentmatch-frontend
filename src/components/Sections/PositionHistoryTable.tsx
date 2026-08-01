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
    onEdit?: (id: number | string) => void;
}

const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return "—";
    const d = new Date(dateString);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" });
};

const PositionHistoryTable: React.FC<PositionHistoryTableProps> = ({ data = [], onDelete, onDuplicate, onEdit }) => {
    return (
        <table className="w-full">
            <thead>
                <tr className="border-b border-gray-50">
                    <th className="text-left px-5 py-3 text-xs text-gray-400 uppercase tracking-wider">Posición</th>
                    <th className="text-left px-4 py-3 text-xs text-gray-400 uppercase tracking-wider">Departamento</th>
                    <th className="text-left px-4 py-3 text-xs text-gray-400 uppercase tracking-wider">Fecha</th>
                    <th className="px-4 py-3 text-xs text-gray-400 uppercase tracking-wider text-right">Acciones</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
                {data.map((position) => {
                    const { id, role, createdAt, departmentName, department } = position;
                    const resolvedDept = department?.name || departmentName || "General";

                    return (
                        <tr key={id} className="hover:bg-gray-50 transition-colors group">
                            <td className="px-5 py-3.5">
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                                        style={{ backgroundColor: '#DCF9FF' }}
                                    >
                                        <Briefcase size={13} style={{ color: '#447ECA' }} />
                                    </div>
                                    <span className="text-sm text-gray-700">{role || "Puesto sin definir"}</span>
                                </div>
                            </td>
                            <td className="px-4 py-3.5">
                                <span
                                    className="text-xs px-2 py-1 rounded-full"
                                    style={{ backgroundColor: '#F0F0F5', color: '#6B7280' }}
                                >
                                    {resolvedDept}
                                </span>
                            </td>
                            <td className="px-4 py-3.5 text-sm text-gray-400">
                                {formatDate(createdAt)}
                            </td>
                            <td className="px-4 py-3.5 text-right">
                                <ActionDropdown
                                    onDelete={() => onDelete(id)}
                                    onDuplicate={() => onDuplicate(id)}
                                    onEdit={() => onEdit?.(id)}
                                />
                            </td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
    );
};

export default PositionHistoryTable;
