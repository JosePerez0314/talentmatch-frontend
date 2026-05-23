import React, { useState } from "react";
//Rules
import { Department } from "../types/department.types";
//Assets
import { Icons } from "../assets/icons";

//Components
import EditDepartmentModal from "../components/modals/EditDepartmentModal";
import DeleteDepartmentModal from "../components/modals/DeleteDepartmentModal";

// --- MOCK DATA ---
const INITIAL_DEPARTMENTS: Department[] = [
    { id: "1", name: "Tecnología / IT", positionsCount: 2 },
    { id: "2", name: "Ventas", positionsCount: 2 },
    { id: "3", name: "Recursos Humanos", positionsCount: 1 },
    { id: "4", name: "Finanzas & Contabilidad", positionsCount: 0 },
    { id: "5", name: "Operaciones", positionsCount: 2 },
    { id: "6", name: "Marketing", positionsCount: 0 },
    { id: "7", name: "Legal", positionsCount: 0 },
];

const DepartmentHistory: React.FC = () => {
    const [departments, setDepartments] = useState<Department[]>(INITIAL_DEPARTMENTS);
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    
    // Estados para Modales
    const [editModalDept, setEditModalDept] = useState<Department | null>(null);
    const [deleteModalDept, setDeleteModalDept] = useState<Department | null>(null);

    // Handlers Menu Kebab
    const toggleMenu = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setOpenMenuId(openMenuId === id ? null : id);
    };

    const closeMenu = () => setOpenMenuId(null);

    // Handlers Modales
    const handleSaveEdit = (id: string, newName: string) => {
        setDepartments(prev => prev.map(d => d.id === id ? { ...d, name: newName } : d));
    };

    const handleConfirmDelete = (id: string) => {
        setDepartments(prev => prev.filter(d => d.id !== id));
        setDeleteModalDept(null);
    };

    return (
        <div className="min-h-screen bg-[#F0F2F5] p-10 animate-fade-in" onClick={closeMenu}>
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
                                    <div className="w-12 h-12 bg-[#EAF7FF] rounded-full flex items-center justify-center shrink-0">
                                        <img src={Icons.departaments.layers} alt="Layers" className="w-5 h-5 object-contain" />
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

                                <div className="flex items-center gap-4">
                                    {dept.positionsCount > 0 && (
                                        <div className="w-7 h-7 bg-[#DCF9FF] text-[#447ECA] rounded-full flex items-center justify-center text-xs font-bold">
                                            {dept.positionsCount}
                                        </div>
                                    )}
                                    
                                    <button 
                                        onClick={(e) => toggleMenu(dept.id, e)}
                                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
                                    >
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/></svg>
                                    </button>

                                    {/* MENU KEBAB DROPDOWN */}
                                    {openMenuId === dept.id && (
                                        <div className="absolute right-8 top-16 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-fade-in" onClick={e => e.stopPropagation()}>
                                            <button 
                                                onClick={() => { setEditModalDept(dept); closeMenu(); }}
                                                className="w-full text-left px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                                            >
                                                <img src={Icons.departaments.pencilEdit} alt="Edit" className="w-4 h-4 opacity-60" />
                                                Editar nombre
                                            </button>
                                            <button 
                                                onClick={() => { setDeleteModalDept(dept); closeMenu(); }}
                                                className="w-full text-left px-5 py-3 text-sm font-medium text-red-500 hover:bg-red-50 flex items-center gap-3 transition-colors"
                                            >
                                                <img src={Icons.departaments.deleteTrash} alt="Delete" className="w-4 h-4 opacity-60" style={{ filter: 'invert(39%) sepia(87%) saturate(1412%) hue-rotate(326deg) brightness(97%) contrast(90%)' }} />
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

            {/* Modales */}
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