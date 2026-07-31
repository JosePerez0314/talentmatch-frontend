import React, { useState, useEffect } from "react";
import { Department } from "../../types/department.types";

interface EditDepartmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    department: Department | null;
    onSave: (id: string, newName: string) => void;
}

const EditDepartmentModal: React.FC<EditDepartmentModalProps> = ({ isOpen, onClose, department, onSave }) => {
    const [newName, setNewName] = useState<string>("");

    useEffect(() => {
        if (department) setNewName(department.name);
    }, [department]);

    if (!isOpen || !department) return null;

    const handleSave = () => {
        if (newName.trim() !== "") {
            onSave(department.id, newName);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl flex flex-col overflow-hidden">
                <div className="px-6 py-5 flex justify-between items-center border-b border-gray-100 bg-gray-50/50">
                    <h2 className="text-gray-900 font-bold text-lg">Editar nombre</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-200">✕</button>
                </div>

                <div className="p-6">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">
                        Nombre del departamento
                    </label>
                    <input
                        type="text"
                        value={newName}
                        placeholder="Ej. Tecnología / IT"
                        onChange={(e) => setNewName(e.target.value)}
                        className="w-full p-4 bg-white border border-gray-300 rounded-xl outline-none focus:border-[#447ECA] focus:ring-4 focus:ring-[#447ECA]/10 transition-all text-gray-800 font-medium"
                        autoFocus
                    />
                </div>

                <div className="p-6 pt-0 flex justify-end gap-3">
                    <button onClick={onClose} className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all">
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!newName.trim() || newName === department.name}
                        className="px-6 py-2.5 bg-[#447ECA] text-white rounded-xl text-sm font-bold shadow-sm transition-all hover:bg-[#3669ab] disabled:opacity-50 disabled:hover:bg-[#447ECA] flex items-center gap-2"
                    >
                        Guardar cambios
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditDepartmentModal;