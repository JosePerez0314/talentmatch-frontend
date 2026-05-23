import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
//Assets
import { Icons } from "../assets/icons/index";

const CreateDepartment: React.FC = () => {
    const navigate = useNavigate();
    const [departmentName, setDepartmentName] = useState<string>("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!departmentName.trim()) return;
        
        // Simulación de guardado
        console.log("Guardando departamento:", departmentName);
        navigate("/department-history");
    };

    return (
        <div className="min-h-screen bg-[#F0F2F5] p-10 animate-fade-in flex flex-col items-center">
            <div className="w-full max-w-3xl">
                <header className="mb-8 text-left">
                    <h1 className="text-3xl font-medium text-[#1E293B] tracking-tight">Nuevo Departamento</h1>
                    <p className="text-gray-400 text-sm mt-1">Agrega un área organizacional a tu catálogo.</p>
                </header>

                <form onSubmit={handleSubmit} className="w-full">
                    <div className="bg-white rounded-[24px] p-8 shadow-sm border border-gray-100 mb-6">
                        <div className="flex items-start gap-4 mb-6">
                            <div className="w-12 h-12 bg-[#DCF9FF] rounded-xl flex items-center justify-center shrink-0">
                                <img src={Icons.departaments.folderPlus} alt="Folder" className="w-6 h-6 object-contain" />
                            </div>
                            <div>
                                <h2 className="text-[#1E293B] font-medium text-base">Información del departamento</h2>
                                <p className="text-gray-400 text-sm">Podrás asignar posiciones a este departamento desde el Wizard.</p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label htmlFor="deptName" className="text-sm font-medium text-gray-700">
                                Nombre del departamento <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="deptName"
                                type="text"
                                value={departmentName}
                                onChange={(e) => setDepartmentName(e.target.value)}
                                placeholder="Ej: Tecnología / IT, Ventas, Legal..."
                                className="w-full p-4 bg-white border border-[#447ECA]/40 rounded-xl outline-none focus:border-[#447ECA] focus:ring-4 focus:ring-[#447ECA]/10 transition-all text-[#334155] placeholder:text-gray-300"
                                required
                            />
                        </div>
                    </div>

                    <div className="flex justify-between items-center">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="flex items-center gap-2 px-6 py-3.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all shadow-sm"
                        >
                            <span>←</span> Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={!departmentName.trim()}
                            className="px-8 py-3.5 bg-[#A4BDE4] text-white rounded-xl text-sm font-bold shadow-sm transition-all disabled:opacity-50 hover:bg-[#447ECA] active:scale-95"
                        >
                            Crear Departamento
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateDepartment;