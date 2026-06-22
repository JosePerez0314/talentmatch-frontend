import React, { useState, useEffect } from "react";
import { Department } from "../types/department.types";
import { FiLayers, FiMoreVertical, FiEdit2, FiTrash2, FiClock } from "react-icons/fi";

// Importamos el servicio real de la API
import { departmentsApi } from "../services/api/departments.api";

import EditDepartmentModal from "../components/modals/EditDepartmentModal";
import DeleteDepartmentModal from "../components/modals/DeleteDepartmentModal";

const DepartmentHistory: React.FC = () => {
    // Estado inicial vacío para llenarse con los datos del backend
    const [departments, setDepartments] = useState<Department[]>([]);
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);

    // Estados de control de flujo asíncrono
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const [editModalDept, setEditModalDept] = useState<Department | null>(null);
    const [deleteModalDept, setDeleteModalDept] = useState<Department | null>(null);

    // FUNCIÓN CENTRAL: GET /departments/
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

    // Efecto de montaje para sincronizar los datos al cargar la pantalla
    useEffect(() => {
        fetchDepartments();
    }, []);

    const toggleMenu = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setOpenMenuId(openMenuId === id ? null : id);
    };

    const closeMenu = () => setOpenMenuId(null);

    // MANEJADOR ASÍNCRONO: PUT /departments/:id
    const handleSaveEdit = async (id: string, newName: string) => {
        try {
            await departmentsApi.update(id, { name: newName });

            // Sincronización del estado local inmediato tras el éxito en base de datos
            setDepartments(prev => prev.map(d => d.id === id ? { ...d, name: newName } : d));
            setEditModalDept(null);
        } catch (err) {
            const errorObj = err as Error;
            alert(`Error al actualizar el departamento: ${errorObj.message}`);
        }
    };

    // MANEJADOR ASÍNCRONO: DELETE /departments/:id
    const handleConfirmDelete = async (id: string) => {
        try {
            await departmentsApi.delete(id);

            // Filtramos el registro del estado local para no forzar un refetch innecesario
            setDepartments(prev => prev.filter(d => d.id !== id));
            setDeleteModalDept(null);
        } catch (err) {
            const errorObj = err as Error;
            alert(`Error al eliminar el departamento: ${errorObj.message}`);
        }
    };

    return (
        <div className="min-h-screen bg-[#F0F2F5] p-10" onClick={closeMenu}>
            <div className="max-w-5xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-3xl font-medium text-[#1E293B] tracking-tight">Departamentos</h1>
                    <p className="text-gray-400 text-sm mt-1">Gestiona las áreas de tu organización y las posiciones vinculadas a cada una.</p>
                </header>

                <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-8 py-5 border-b border-gray-100 bg-white flex justify-between items-center">
                        <span className="text-gray-400 text-[11px] font-black uppercase tracking-[2px]">
                            {loading ? "Cargando..." : `${departments.length} DEPARTAMENTOS`}
                        </span>
                        {loading && (
                            <span className="text-xs text-[#447ECA] font-medium animate-pulse">
                                Sincronizando con la API...
                            </span>
                        )}
                    </div>

                    {/* Manejo visual de errores de red o autenticación */}
                    {error && (
                        <div className="p-6 text-center text-sm font-medium text-red-500 bg-red-50 border-b border-red-100">
                            {error}
                        </div>
                    )}

                    {/* Estado vacío (Empty State) */}
                    {!loading && departments.length === 0 && !error && (
                        <div className="p-16 text-center text-gray-400 text-sm">
                            No existen departamentos creados en la organización.
                        </div>
                    )}

                    <div className="divide-y divide-gray-50">
                        {!loading && departments.map((dept) => (
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
                                    {/* Componente UI de fecha de creación real solicitada */}
                                    <div className="flex items-center gap-1.5 text-gray-400 text-xs font-medium whitespace-nowrap">
                                        <FiClock className="text-gray-300 text-sm" />
                                        <span>
                                            Creado: {dept.createdAt ? new Date(dept.createdAt).toLocaleDateString() : "01/01/2026"}
                                        </span>
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