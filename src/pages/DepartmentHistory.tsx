import React, { useState } from "react";
import { Department } from "../types/department.types";
import { FiLayers, FiMoreVertical, FiEdit2, FiTrash2, FiClock } from "react-icons/fi";

import EditDepartmentModal from "../components/modals/EditDepartmentModal";
import DeleteDepartmentModal from "../components/modals/DeleteDepartmentModal";

interface ExtendedDepartment extends Department {
    createdAt?: string;
}

const INITIAL_DEPARTMENTS: ExtendedDepartment[] = [
    { id: "1", name: "Tecnología / IT", positionsCount: 2, createdAt: "01/01/2026" },
    { id: "2", name: "Ventas", positionsCount: 2, createdAt: "01/01/2026" },
    { id: "3", name: "Recursos Humanos", positionsCount: 1, createdAt: "01/01/2026" },
    { id: "4", name: "Finanzas & Contabilidad", positionsCount: 0, createdAt: "01/01/2026" },
    { id: "5", name: "Operaciones", positionsCount: 2, createdAt: "01/01/2026" },
    { id: "6", name: "Marketing", positionsCount: 0, createdAt: "01/01/2026" },
    { id: "7", name: "Legal", positionsCount: 0, createdAt: "01/01/2026" },
];

const DepartmentHistory: React.FC = () => {
    const [departments, setDepartments] = useState<ExtendedDepartment[]>(INITIAL_DEPARTMENTS);
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);

    const [editModalDept, setEditModalDept] = useState<ExtendedDepartment | null>(null);
    const [deleteModalDept, setDeleteModalDept] = useState<ExtendedDepartment | null>(null);

    const toggleMenu = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setOpenMenuId(openMenuId === id ? null : id);
    };

    const closeMenu = () => setOpenMenuId(null);

    const handleSaveEdit = (id: string, newName: string) => {
        setDepartments(prev => prev.map(d => d.id === id ? { ...d, name: newName } : d));
    };

    const handleConfirmDelete = (id: string) => {
        setDepartments(prev => prev.filter(d => d.id !== id));
        setDeleteModalDept(null);
    };

    return (
        <div className="min-h-screen bg-[#F0F2F5] p-10" onClick={closeMenu}>
            <div className="max-w-5xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-3xl font-medium text-[#1E293B] tracking-tight">Departamentos</h1>
                    <p className="text-gray-400 text-sm mt-1">Gestiona las áreas de tu organización y las posiciones vinculadas a cada una.</p>
                </header>

                <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-8 py-5 border-b border-gray-100 bg-white">
                        <span className="text-gray-400 text-[11px] font-black uppercase tracking-[2px]">
                            {departments.length} DEPARTAMENTOS
                        </span>
                    </div>

                    <div className="divide-y divide-gray-50">
                        {departments.map((dept) => (
                            <div key={dept.id} className="px-8 py-5 flex items-center justify-between hover:bg-[#F8FBFF] transition-colors group relative">
                                <div className="flex items-center gap-5">
                                    <div className="w-12 h-12 bg-[#EAF7FF] rounded-full flex items-center justify-center shrink-0 text-[#447ECA]">
                                        <FiLayers className="text-xl" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[#1E293B] font-medium text-base">{dept.name}</span>
                                        <span className="text-gray-400 text-sm">
                                            {dept.positionsCount === 0 ? "Sin posiciones asignadas" :
                                                dept.positionsCount === 1 ? "1 posición asignada" :
                                                    `${dept.positionsCount} posiciones asignadas`}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6">
                                    {/* Muestra la fecha de creación alineada */}
                                    <div className="flex items-center gap-1.5 text-gray-400 text-xs font-medium whitespace-nowrap">
                                        <FiClock className="text-gray-300 text-sm" />
                                        <span>Creado: {dept.createdAt || "01/01/2026"}</span>
                                    </div>

                                    {dept.positionsCount > 0 && (
                                        <div className="w-7 h-7 bg-[#DCF9FF] text-[#447ECA] rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                                            {dept.positionsCount}
                                        </div>
                                    )}

                                    <button
                                        onClick={(e) => toggleMenu(dept.id, e)}
                                        title="Opciones de departamento"
                                        aria-label="Opciones de departamento"
                                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600 shrink-0"
                                    >
                                        <FiMoreVertical className="text-lg" />
                                    </button>

                                    {openMenuId === dept.id && (
                                        <div className="absolute right-8 top-16 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50" onClick={e => e.stopPropagation()}>
                                            <button
                                                onClick={() => { setEditModalDept(dept); closeMenu(); }}
                                                className="w-full text-left px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                                            >
                                                <FiEdit2 className="text-blue-500 text-base" />
                                                Editar nombre
                                            </button>
                                            <button
                                                onClick={() => { setDeleteModalDept(dept); closeMenu(); }}
                                                className="w-full text-left px-5 py-3 text-sm font-medium text-red-500 hover:bg-red-50 flex items-center gap-3 transition-colors"
                                            >
                                                <FiTrash2 className="text-base" />
                                                Eliminar
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <EditDepartmentModal
                isOpen={!!editModalDept}
                onClose={() => setEditModalDept(null)}
                department={editModalDept}
                onSave={handleSaveEdit}
            />

            <DeleteDepartmentModal
                isOpen={!!deleteModalDept}
                onClose={() => setDeleteModalDept(null)}
                department={deleteModalDept}
                onConfirm={handleConfirmDelete}
            />
        </div>
    );
};

export default DepartmentHistory;