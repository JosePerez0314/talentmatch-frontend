import React from "react";
import { Vacancy, VacancyStatus } from "../../types/api.types";

interface VacancyActionModalProps {
    isOpen: boolean;
    onClose: () => void;
    vacancy: Vacancy | null;
    targetStatus: VacancyStatus | null;
    onConfirm: (id: number, status: VacancyStatus) => void;
}

const VacancyActionModal: React.FC<VacancyActionModalProps> = ({ isOpen, onClose, vacancy, targetStatus, onConfirm }) => {
    if (!isOpen || !vacancy || !targetStatus) return null;

    // Adaptado a la API oficial
    const getModalConfig = () => {
        switch (targetStatus) {
            case 'ACTIVE':
                return {
                    title: "Marcar vacante como Activa",
                    message: `¿Estás seguro de que deseas activar la vacante "${vacancy.title}"? Volverá a estar visible para recibir nuevos perfiles y postulaciones.`,
                    btnClass: "bg-emerald-600 hover:bg-emerald-700",
                    actionText: "Activar"
                };
            case 'PAUSED':
                return {
                    title: "Pausar vacante",
                    message: `¿Estás seguro de que deseas pausar la vacante "${vacancy.title}"? El procesamiento de candidatos se detendrá temporalmente.`,
                    btnClass: "bg-amber-500 hover:bg-amber-600",
                    actionText: "Pausar"
                };
            case 'CLOSED':
                return {
                    title: "Cerrar vacante",
                    message: `¿Estás seguro de que deseas cerrar de forma definitiva la vacante "${vacancy.title}"? Esta acción finalizará el proceso de inmediato.`,
                    btnClass: "bg-red-600 hover:bg-red-700",
                    actionText: "Cerrar Vacante"
                };
            default:
                return { title: "Confirmar acción", message: "", btnClass: "bg-blue-600", actionText: "Confirmar" };
        }
    };

    const config = getModalConfig();

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white w-full max-w-md rounded-[24px] shadow-2xl flex flex-col overflow-hidden border border-gray-50">
                <div className="px-6 py-5 flex justify-between items-center border-b border-gray-100">
                    <h2 className="text-[#1E293B] font-semibold text-lg">{config.title}</h2>
                    <button onClick={onClose} title="Cerrar modal" aria-label="Cerrar modal" className="text-gray-400 hover:text-gray-600 transition-colors">✕</button>
                </div>
                <div className="p-6 text-sm text-[#475569] leading-relaxed">
                    {config.message}
                </div>
                <div className="p-6 pt-0 flex justify-end gap-3">
                    <button onClick={onClose} className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all">
                        Cancelar
                    </button>
                    <button
                        onClick={() => { onConfirm(vacancy.id, targetStatus); onClose(); }}
                        className={`px-5 py-2.5 text-white rounded-xl text-sm font-semibold shadow-sm transition-all ${config.btnClass}`}
                    >
                        {config.actionText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VacancyActionModal;