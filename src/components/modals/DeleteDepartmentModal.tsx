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
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl flex flex-col overflow-hidden">

                <div className="p-8 pb-6 flex items-start gap-5">
                    <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center shrink-0 text-red-500 border border-red-100">
                        <FiAlertTriangle className="text-2xl" />
                    </div>
                    <div>
                        <h2 className="text-gray-900 font-bold text-xl leading-tight">¿Eliminar departamento?</h2>
                        <p className="text-gray-500 text-sm mt-2 font-medium">Esta acción es irreversible y afectará a la estructura actual.</p>
                    </div>
                </div>

                <div className="px-8 pb-6">
                    <div className="p-4 border border-red-100 rounded-xl bg-red-50/30 mb-6">
                        <p className="text-gray-700 text-sm leading-relaxed font-medium">
                            Al eliminar <strong className="text-red-600">{department.name}</strong>, se eliminarán automáticamente <strong className="text-gray-900">{department.positionsCount} posiciones asignadas</strong>, pausando las vacantes vinculadas.
                        </p>
                    </div>

                    <label className="block text-sm text-gray-600 font-medium mb-2 ml-1">
                        Escribe <strong className="text-red-500 select-all">{department.name}</strong> para confirmar:
                    </label>
                    <input
                        type="text"
                        value={confirmationText}
                        onChange={(e) => setConfirmationText(e.target.value)}
                        placeholder={department.name}
                        className="w-full p-4 border border-gray-300 rounded-xl outline-none focus:border-red-400 focus:ring-4 focus:ring-red-500/10 transition-all text-gray-900 font-semibold"
                    />
                </div>

                <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50">
                    <button onClick={onClose} className="px-5 py-2.5 border border-gray-200 bg-white rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 hover:text-gray-800 transition-all shadow-sm">
                        Cancelar
                    </button>
                    <button
                        onClick={() => onConfirm(department.id)}
                        disabled={!isMatch}
                        className="px-6 py-2.5 bg-red-600 text-white rounded-xl text-sm font-bold shadow-sm transition-all hover:bg-red-700 disabled:opacity-50 disabled:hover:bg-red-600 flex items-center gap-2"
                    >
                        <FiTrash2 className="text-base" />
                        Sí, eliminar todo
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteDepartmentModal;