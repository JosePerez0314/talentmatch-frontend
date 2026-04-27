import React, { useState, useRef, useEffect } from "react";
import { Icons } from "../../assets/icons";

const StatusDropdown = ({ currentStatus = "No contratado", onStatusChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const options = ["No contratado", "Contratado", "Contactar"];

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative inline-block text-left" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between w-40 px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-[#DCF9FF] transition-all active:scale-95"
            >
                <span className="truncate">{currentStatus}</span>
                <img
                    src={Icons.auth.arrow || Icons.stats.createPlus}
                    className={`w-3 ml-2 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                    alt="arrow"
                    style={{
                        /* Filtro específico para convertir cualquier color base al azul #447ECA */
                        filter: "invert(42%) sepia(85%) saturate(1212%) hue-rotate(189deg) brightness(91%) contrast(85%)"
                    }}
                />
            </button>

            {isOpen && (
                <div className="absolute right-0 z-50 mt-2 w-44 bg-white rounded-2xl shadow-[0px_10px_40px_rgba(0,0,0,0.12)] border border-gray-100 overflow-hidden animate-in fade-in zoom-in duration-200">
                    <div className="py-1">
                        {options.map((option) => (
                            <button
                                key={option}
                                onClick={() => {
                                    onStatusChange?.(option);
                                    setIsOpen(false);
                                }}
                                className={`w-full text-left px-4 py-3 text-[11px] font-bold uppercase tracking-tight transition-colors border-b border-gray-50 last:border-0 ${currentStatus === option
                                    ? "text-[#447ECA] bg-blue-50/50"
                                    : "text-gray-600 hover:bg-gray-50"
                                    }`}
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default StatusDropdown;