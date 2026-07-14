import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FolderPlus, ArrowLeft } from "lucide-react";
import { departmentsApi } from "../services/api/departments.api";
import { ApiError } from "../services/api/apiClient";

const CreateDepartment: React.FC = () => {
    const navigate = useNavigate();
    const [departmentName, setDepartmentName] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!departmentName.trim() || isSubmitting) return;

        try {
            setIsSubmitting(true);
            setError(null);
            await departmentsApi.create({ name: departmentName.trim() });
            navigate("/department-history");
        } catch (err) {
            console.error("Error en formulario de departamento:", err);

            if (err instanceof ApiError && err.data && typeof err.data === "object") {
                const serverData = err.data as { message?: string; error?: string; details?: unknown };
                console.debug("Zod validation details:", serverData.details);
                const msg = serverData.message || serverData.error || JSON.stringify(serverData);
                setError(`Error del Servidor: ${msg}`);
                return;
            }

            const message = err instanceof Error ? err.message : "";
            setError(message || "No se pudo registrar el departamento. Intenta de nuevo.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="p-4 md:p-8 max-w-2xl mx-auto">
            <header className="mb-6">
                <h1 className="text-gray-800">Nuevo Departamento</h1>
                <p className="text-gray-400 text-sm mt-0.5">Agrega un área organizacional a tu catálogo.</p>
            </header>

            <form onSubmit={handleSubmit}>
                {error && (
                    <div className="mb-4 p-3 text-sm font-medium text-red-500 bg-red-50 border border-red-100 rounded-xl">
                        {error}
                    </div>
                )}

                <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
                    <div className="flex items-center gap-3 mb-2">
                        <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: '#DCF9FF' }}
                        >
                            <FolderPlus size={19} style={{ color: '#447ECA' }} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-700">Información del departamento</p>
                            <p className="text-xs text-gray-400">Podrás asignar posiciones a este departamento desde el Wizard.</p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="deptName" className="text-sm text-gray-600">
                            Nombre del departamento <span className="text-red-400">*</span>
                        </label>
                        <input
                            id="deptName"
                            type="text"
                            value={departmentName}
                            onChange={(e) => setDepartmentName(e.target.value)}
                            disabled={isSubmitting}
                            placeholder="Ej: Tecnología / IT, Ventas, Legal..."
                            className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:border-[#447ECA] transition-colors disabled:bg-gray-50 disabled:text-gray-400"
                            required
                        />
                    </div>
                </div>

                <div className="flex items-center justify-between mt-4">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        disabled={isSubmitting}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white hover:bg-gray-50 text-gray-600 transition-colors disabled:opacity-50"
                    >
                        <ArrowLeft size={15} /> Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={!departmentName.trim() || isSubmitting}
                        className="px-6 py-2.5 text-sm text-white rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        style={{ backgroundColor: '#447ECA' }}
                        onMouseOver={e => { if (departmentName.trim() && !isSubmitting) e.currentTarget.style.backgroundColor = '#3a6bb8'; }}
                        onMouseOut={e => { e.currentTarget.style.backgroundColor = '#447ECA'; }}
                    >
                        {isSubmitting ? "Guardando..." : "Crear Departamento"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateDepartment;
