import React, { useState, useEffect } from "react";
import { Department } from "../../types/department.types";
import { FiAlertTriangle, FiTrash2 } from "react-icons/fi";

interface DeleteDepartmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    department: Department | null;
    onConfirm: (id: string) => void;
}

const DeleteDepartmentModal: React.FC<DeleteDepartmentModalProps> = ({ isOpen, onClose, department, onConfirm }) => {
    const [confirmationText, setConfirmationText] = useState<string>("");

    useEffect(() => {
        if (isOpen) setConfirmationText("");
    }, [isOpen]);

    if (!isOpen || !department) return null;

    const isMatch = confirmationText === department.name;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in p-4">
            <div className="bg-white w-full max-w-lg rounded-[24px] shadow-2xl flex flex-col overflow-hidden">

                <div className="p-8 pb-6 flex items-start gap-4">
                    <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center shrink-0 text-red-500">
                        <FiAlertTriangle className="text-xl" />
                    </div>
                    <div>
                        <h2 className="text-[#1E293B] font-medium text-lg leading-tight">¿Estás seguro de que deseas eliminar este departamento?</h2>
                        <p className="text-red-400 text-sm mt-1">Esta acción es irreversible</p>
                    </div>
                </div>

                <div className="px-8 pb-6">
                    <div className="p-4 border border-red-100 rounded-xl bg-white mb-6">
                        <p className="text-gray-600 text-sm leading-relaxed">
                            Al eliminar <strong className="text-red-500">{department.name}</strong>, se eliminarán automáticamente <strong className="text-gray-800">{department.positionsCount} posiciones asignadas</strong> a él, pausando las vacantes vinculadas.
                        </p>
                    </div>

                    <label className="block text-sm text-gray-500 mb-2">
                        Para confirmar, escribe <strong className="text-red-500">{department.name}</strong>
                    </label>
                    <input
                        type="text"
                        value={confirmationText}
                        onChange={(e) => setConfirmationText(e.target.value)}
                        placeholder={department.name}
                        className="w-full p-4 border border-gray-200 rounded-xl outline-none focus:border-red-300 focus:ring-4 focus:ring-red-50 transition-all text-[#334155]"
                    />
                </div>

                <div className="p-6 border-t border-gray-50 flex justify-end gap-3 bg-gray-50/50">
                    <button onClick={onClose} className="px-6 py-3 border border-gray-200 bg-white rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all">
                        Cancelar
                    </button>
                    <button
                        onClick={() => onConfirm(department.id)}
                        disabled={!isMatch}
                        className="px-6 py-3 bg-[#FCA5A5] text-white rounded-xl text-sm font-bold shadow-sm transition-all hover:bg-red-500 disabled:opacity-50 flex items-center gap-2"
                    >
                        <FiTrash2 className="text-base" />
                        Sí, Eliminar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteDepartmentModal;