import React, { useState, useRef, useEffect } from "react";
import { MoreVertical, Edit2, Copy, Trash2 } from "lucide-react";

interface ActionDropdownProps {
    onDuplicate: () => void;
    onDelete: () => void;
    onEdit?: () => void;
    isUpward?: boolean;
}

const ActionDropdown: React.FC<ActionDropdownProps> = ({ onDuplicate, onDelete, onEdit, isUpward = false }) => {
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
                className={`p-1.5 w-8 h-8 rounded-lg transition-all flex items-center justify-center cursor-pointer ${
                    isOpen ? "bg-gray-200 text-gray-800 shadow-inner" : "text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                }`}
            >
                <MoreVertical size={18} />
            </button>

            {isOpen && (
                <div 
                    /* Lógica del Flip Upward Cambia la posicion dependiendo de isUpward */
                    className={`absolute right-0 w-48 bg-white border border-gray-100 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] py-2 z-50 animate-fade-in text-left ${
                        isUpward ? 'bottom-full mb-1' : 'top-full mt-1'
                    }`}
                >
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setIsOpen(false); onEdit?.(); }}
                        className="w-full px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-[#447ECA] flex items-center gap-3 transition-colors cursor-pointer"
                    >
                        <Edit2 size={15} />
                        Editar Posición
                    </button>

                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setIsOpen(false); onDuplicate(); }}
                        className="w-full px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors cursor-pointer"
                    >
                        <Copy size={15} />
                        Duplicar Posición
                    </button>

                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setIsOpen(false); onDelete(); }}
                        className="w-full px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors cursor-pointer"
                    >
                        <Trash2 size={15} />
                        Eliminar Posición
                    </button>
                </div>
            )}
        </div>
    );
};

export default ActionDropdown;