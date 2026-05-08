import React, { useState, useRef, useEffect } from "react";
import { Icons } from "../../assets/icons";

const StatusDropdown = ({ currentStatus = "No contratado", onStatusChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState(currentStatus);
    const dropdownRef = useRef(null);

    const options = ["No contratado", "Contratado", "Contactar"];

    // Sincronizar el estado interno cuando la prop currentStatus cambie (Persistencia)
    useEffect(() => {
        setSelectedStatus(currentStatus);
    }, [currentStatus]);

    // Configuración de colores dinámica
    const statusConfigs = {
        "Contratado": {
            text: "text-[#2D7A4D]",
            border: "border-[#96FFC1]",
            bgHover: "hover:bg-[#96FFC1]/20",
            dot: "bg-[#96FFC1]"
        },
        "Contactar": {
            text: "text-[#A18500]",
            border: "border-[#FFE566]",
            bgHover: "hover:bg-[#FFE566]/20",
            dot: "bg-[#FFE566]"
        },
        "No contratado": {
            text: "text-gray-400",
            border: "border-gray-200",
            bgHover: "hover:bg-gray-50",
            dot: "bg-gray-300"
        }
    };

    const currentConfig = statusConfigs[selectedStatus] || statusConfigs["No contratado"];

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleToggle = (e) => {
        e.stopPropagation();
        setIsOpen(!isOpen);
    };

    const handleSelect = (option, e) => {
        e.stopPropagation();
        setSelectedStatus(option);
        onStatusChange?.(option);
        setIsOpen(false);
    };

    return (
        <div className="relative inline-block text-left" ref={dropdownRef}>
            <button
                onClick={handleToggle}
                className={`flex items-center justify-between w-40 px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider transition-all active:scale-95 bg-white border rounded-xl 
                ${currentConfig.text} ${currentConfig.border} ${currentConfig.bgHover}`}
            >
                <div className="flex items-center gap-2 truncate">
                    <span className={`w-2 h-2 rounded-full ${currentConfig.dot}`}></span>
                    <span className="truncate">{selectedStatus}</span>
                </div>
                <img
                    src={Icons.auth.arrow || Icons.stats.createPlus}
                    className={`w-3 ml-2 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                    alt="arrow"
                    style={{
                        filter: selectedStatus === "No contratado"
                            ? "none"
                            : "invert(40%) sepia(10%) saturate(100%) brightness(50%)"
                    }}
                />
            </button>

            {isOpen && (
                <div className="absolute right-0 z-50 mt-2 w-44 bg-white rounded-2xl shadow-[0px_10px_40px_rgba(0,0,0,0.12)] border border-gray-100 overflow-hidden animate-in fade-in zoom-in duration-200">
                    <div className="py-1">
                        {options.map((option) => (
                            <button
                                key={option}
                                onClick={(e) => handleSelect(option, e)}
                                className={`w-full text-left px-4 py-3 text-[11px] font-bold uppercase tracking-tight transition-colors border-b border-gray-50 last:border-0 ${selectedStatus === option
                                    ? "text-blue-600 bg-blue-50/50"
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