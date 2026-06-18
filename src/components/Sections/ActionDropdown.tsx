import React, { useState, useRef, useEffect } from "react";
import { MoreVertical, Edit2, Copy, Trash2 } from "lucide-react";

interface ActionDropdownProps {
    onDuplicate: () => void;
    onDelete: () => void;
    onEdit?: () => void; // Por si en el futuro decides usarlo
}

const ActionDropdown: React.FC<ActionDropdownProps> = ({ onDuplicate, onDelete, onEdit }) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    return (
        <div className="relative inline-block text-left" ref={dropdownRef}>
            <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
                title="Opciones"
                aria-label="Opciones"
                className={`p-1.5 rounded-lg transition-all flex items-center justify-center cursor-pointer ${isOpen ? "bg-gray-100 text-gray-700" : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                    }`}>
                <MoreVertical size={16} />
            </button>

            {/* Desplegable fiel a la captura de Figma */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-2xl shadow-xl py-2 z-50 animate-fade-in text-left">

                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setIsOpen(false); onEdit?.(); }}
                        className="w-full px-4 py-2.5 text-[14px] font-medium text-gray-600 hover:bg-gray-50 flex items-center gap-3 transition-colors cursor-pointer group">
                        <Edit2 size={15} className="text-gray-400 group-hover:text-gray-500 transition-colors" />
                        Editar Posición
                    </button>

                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setIsOpen(false); onDuplicate(); }}
                        className="w-full px-4 py-2.5 text-[14px] font-medium text-gray-600 hover:bg-gray-50 flex items-center gap-3 transition-colors cursor-pointer group">
                        <Copy size={15} className="text-gray-400 group-hover:text-gray-500 transition-colors" />
                        Duplicar Posición
                    </button>

                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setIsOpen(false); onDelete(); }}
                        className="w-full px-4 py-2.5 text-[14px] font-medium text-[#e53e3e] hover:bg-red-50/40 flex items-center gap-3 transition-colors cursor-pointer group">
                        <Trash2 size={15} className="text-red-400 group-hover:text-red-500 transition-colors" />
                        Eliminar Posición
                    </button>

                </div>
            )}
        </div>
    );
};

export default ActionDropdown;