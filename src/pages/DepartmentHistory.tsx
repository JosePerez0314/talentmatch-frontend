import React, { useState, useEffect } from "react";
import { Department } from "../types/department.types";
import { Layers, MoreVertical, Pencil, Trash2, Clock } from "lucide-react";

import { departmentsApi } from "../services/api/departments.api";

import EditDepartmentModal from "../components/modals/EditDepartmentModal";
import DeleteDepartmentModal from "../components/modals/DeleteDepartmentModal";

const DepartmentHistory: React.FC = () => {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);

    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const [editModalDept, setEditModalDept] = useState<Department | null>(null);
    const [deleteModalDept, setDeleteModalDept] = useState<Department | null>(null);

    const fetchDepartments = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await departmentsApi.getAll();
            setDepartments(data);
        } catch (err) {
            const errorObj = err as Error;
            setError(errorObj.message || "Error al cargar los departamentos desde el servidor.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { 
        fetchDepartments(); 
    }, []);

    // Cierre de menú clickeando fuera del elemento (Clean Code)
    useEffect(() => {
        const handleClickOutside = () => setOpenMenuId(null);
        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, []);

    // Alternar visibilidad del menú
    const toggleMenu = (id: string, e: React.MouseEvent) => {
        e.stopPropagation(); // Previene que el click llegue al document y cierre el menú de inmediato
        setOpenMenuId(openMenuId === id ? null : id);
    };

    // Función reintroducida para cerrar el menú de forma explícita desde los botones
    const closeMenu = () => setOpenMenuId(null);

    const handleSaveEdit = async (id: string, newName: string) => {
        try {
            setError(null);
            await departmentsApi.update(id, { name: newName });
            setDepartments(prev => prev.map(d => d.id === id ? { ...d, name: newName } : d));
            setEditModalDept(null);
        } catch (err) {
            const errorObj = err as Error;
            setError(`No se pudo actualizar el departamento: ${errorObj.message}`);
        }
    };

    const handleConfirmDelete = async (id: string) => {
        try {
            setError(null);
            await departmentsApi.delete(id);
            setDepartments(prev => prev.filter(d => d.id !== id));
            setDeleteModalDept(null);
        } catch (err) {
            const errorObj = err as Error;
            setError(`No se pudo eliminar el departamento: ${errorObj.message}`);
        }
    };

    return (
        <div className="p-4 md:p-8 max-w-4xl mx-auto animate-fade-in">

            {/* Header */}
            <div className="mb-5 md:mb-6">
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Departamentos</h1>
                <p className="text-gray-500 text-sm mt-1 font-medium">
                    Gestiona las áreas de tu organización y las posiciones vinculadas a cada una.
                </p>
            </div>

            {error && (
                <div className="mb-5 p-4 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-xl shadow-sm">
                    {error}
                </div>
            )}

            {/* Empty state */}
            {!loading && departments.length === 0 && !error && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 md:p-16 flex flex-col items-center gap-5 text-center mt-4">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-[#DCF9FF]">
                        <Layers size={28} className="text-[#447ECA]" />
                    </div>
                    <div>
                        <p className="text-gray-900 text-lg font-bold mb-1.5">No hay departamentos registrados</p>
                        <p className="text-gray-500 text-sm max-w-sm mx-auto">
                            Crea tu primer departamento desde el Wizard de posiciones o usando acciones rápidas.
                        </p>
                    </div>
                </div>
            )}

            {/* Data container */}
            {(loading || departments.length > 0) && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {/* Sub-header */}
                    <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                        <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider">
                            {loading ? "Cargando…" : `${departments.length} departamento${departments.length !== 1 ? "s" : ""}`}
                        </p>
                    </div>

                    <div className="divide-y divide-gray-50">
                        {departments.map((dept, index) => {
                            // Detección dinámica de cercanía al final de la lista para hacer "Flip Upward"
                            const isNearBottom = index >= departments.length - 2 && departments.length > 3;

                            return (
                                <div
                                    key={dept.id}
                                    className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-gray-50/80 transition-colors group relative"
                                >
                                    <div className="flex items-center gap-4 flex-1 min-w-0">
                                        {/* Icon */}
                                        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-[#DCF9FF]">
                                            <Layers size={18} className="text-[#447ECA]" />
                                        </div>

                                        {/* Name + positions count */}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-gray-900 truncate">{dept.name}</p>
                                            <p className="text-xs text-gray-500 mt-0.5 font-medium truncate">
                                                {dept.positionsCount === 0
                                                    ? "Sin posiciones asignadas"
                                                    : dept.positionsCount === 1
                                                        ? "1 posición asignada"
                                                        : `${dept.positionsCount} posiciones asignadas`}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Right Context */}
                                    <div className="flex items-center gap-4 flex-shrink-0">
                                        {/* Date */}
                                        <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                                            <Clock size={12} />
                                            <span>
                                                {dept.createdAt
                                                    ? new Date(dept.createdAt).toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" })
                                                    : "—"}
                                            </span>
                                        </div>

                                        {/* Count badge */}
                                        {dept.positionsCount > 0 && (
                                            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#DCF9FF] text-[#447ECA] shadow-sm">
                                                {dept.positionsCount}
                                            </span>
                                        )}

                                        {/* Acciones */}
                                        <div className="opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={(e) => toggleMenu(dept.id, e)}
                                                title="Opciones de departamento"
                                                className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${openMenuId === dept.id ? 'bg-gray-200 text-gray-800' : 'hover:bg-gray-200 text-gray-400 hover:text-gray-700'}`}
                                            >
                                                <MoreVertical size={18} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Dropdown Kebab */}
                                    {openMenuId === dept.id && (
                                        <div
                                            className={`absolute right-4 w-44 bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border border-gray-100 py-1.5 z-50 ${
                                                isNearBottom ? 'bottom-12 mb-1' : 'top-14'
                                            }`}
                                            onClick={e => e.stopPropagation()}
                                        >
                                            <button
                                                onClick={() => { setEditModalDept(dept); closeMenu(); }}
                                                className="w-full text-left px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-[#447ECA] flex items-center gap-3 transition-colors"
                                            >
                                                <Pencil size={15} />
                                                Editar nombre
                                            </button>
                                            <button
                                                onClick={() => { setDeleteModalDept(dept); closeMenu(); }}
                                                className="w-full text-left px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
                                            >
                                                <Trash2 size={15} />
                                                Eliminar
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

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