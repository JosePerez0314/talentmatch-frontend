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

    useEffect(() => { fetchDepartments(); }, []);

    const toggleMenu = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setOpenMenuId(openMenuId === id ? null : id);
    };

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
        <div className="p-4 md:p-8 max-w-3xl mx-auto" onClick={closeMenu}>

            {/* Header */}
            <div className="mb-6">
                <h1 className="text-gray-800">Departamentos</h1>
                <p className="text-gray-400 text-sm mt-0.5">
                    Gestiona las áreas de tu organización y las posiciones vinculadas a cada una.
                </p>
            </div>

            {error && (
                <div className="mb-5 p-3 text-sm font-medium text-red-500 bg-red-50 border border-red-100 rounded-xl">
                    {error}
                </div>
            )}

            {/* Empty state */}
            {!loading && departments.length === 0 && !error && (
                <div className="bg-white rounded-2xl shadow-sm p-16 flex flex-col items-center gap-4 text-center">
                    <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center"
                        style={{ backgroundColor: '#DCF9FF' }}
                    >
                        <Layers size={24} style={{ color: '#447ECA' }} />
                    </div>
                    <div>
                        <p className="text-gray-600 text-sm mb-1">No hay departamentos registrados</p>
                        <p className="text-gray-400 text-xs">
                            Crea tu primer departamento desde el Wizard de posiciones o el botón del sidebar.
                        </p>
                    </div>
                </div>
            )}

            {/* Data container */}
            {(loading || departments.length > 0) && (
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                    {/* Sub-header */}
                    <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
                        <p className="text-xs text-gray-400 uppercase tracking-wide">
                            {loading ? "Cargando…" : `${departments.length} departamento${departments.length !== 1 ? "s" : ""}`}
                        </p>
                    </div>

                    <div className="divide-y divide-gray-50">
                        {departments.map((dept) => (
                            <div
                                key={dept.id}
                                className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors group relative"
                            >
                                {/* Icon */}
                                <div
                                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                                    style={{ backgroundColor: '#DCF9FF' }}
                                >
                                    <Layers size={16} style={{ color: '#447ECA' }} />
                                </div>

                                {/* Name + positions count */}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-gray-800 truncate">{dept.name}</p>
                                    <p className="text-xs text-gray-400 mt-0.5">
                                        {dept.positionsCount === 0
                                            ? "Sin posiciones asignadas"
                                            : dept.positionsCount === 1
                                                ? "1 posición asignada"
                                                : `${dept.positionsCount} posiciones asignadas`}
                                    </p>
                                </div>

                                {/* Date */}
                                <div className="flex items-center gap-1 text-xs text-gray-400 flex-shrink-0">
                                    <Clock size={11} />
                                    <span>
                                        {dept.createdAt
                                            ? new Date(dept.createdAt).toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" })
                                            : "—"}
                                    </span>
                                </div>

                                {/* Right side: count badge + actions */}
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    {dept.positionsCount > 0 && (
                                        <span
                                            className="px-2 py-0.5 rounded-full text-xs"
                                            style={{ backgroundColor: '#DCF9FF', color: '#447ECA' }}
                                        >
                                            {dept.positionsCount}
                                        </span>
                                    )}

                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={(e) => toggleMenu(dept.id, e)}
                                            title="Opciones de departamento"
                                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
                                        >
                                            <MoreVertical size={16} />
                                        </button>
                                    </div>
                                </div>

                                {/* Dropdown */}
                                {openMenuId === dept.id && (
                                    <div
                                        className="absolute right-4 top-14 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50"
                                        onClick={e => e.stopPropagation()}
                                    >
                                        <button
                                            onClick={() => { setEditModalDept(dept); closeMenu(); }}
                                            className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2.5 transition-colors"
                                        >
                                            <Pencil size={14} className="text-blue-500" />
                                            Editar nombre
                                        </button>
                                        <button
                                            onClick={() => { setDeleteModalDept(dept); closeMenu(); }}
                                            className="w-full text-left px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 flex items-center gap-2.5 transition-colors"
                                        >
                                            <Trash2 size={14} />
                                            Eliminar
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
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
