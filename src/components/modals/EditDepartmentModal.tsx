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
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 backdrop-blur-sm animate-fade-in p-4">
            <div className="bg-white w-full max-w-md rounded-[24px] shadow-2xl flex flex-col overflow-hidden">
                <div className="px-6 py-5 flex justify-between items-center border-b border-gray-100">
                    <h2 className="text-[#1E293B] font-medium text-lg">Editar nombre del departamento</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">✕</button>
                </div>

                <div className="p-6">
                    <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="w-full p-4 bg-white border border-[#447ECA] rounded-xl outline-none focus:ring-4 focus:ring-[#447ECA]/10 transition-all text-[#334155] font-medium"
                        autoFocus
                    />
                </div>

                <div className="p-6 pt-0 flex justify-end gap-3">
                    <button onClick={onClose} className="px-6 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all">
                        Cancelar
                    </button>
                    <button 
                        onClick={handleSave}
                        disabled={!newName.trim() || newName === department.name}
                        className="px-6 py-3 bg-[#A4BDE4] text-white rounded-xl text-sm font-bold shadow-sm transition-all hover:bg-[#447ECA] disabled:opacity-50 flex items-center gap-2"
                    >
                        <span>✓</span> Guardar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditDepartmentModal;