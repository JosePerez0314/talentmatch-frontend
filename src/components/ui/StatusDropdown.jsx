import React, { useState, useRef, useEffect } from "react";
import { Icons } from "../../assets/icons/index.js";

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
                className="flex items-center justify-between w-36 px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-gray-500 bg-gray-50 border border-gray-100 rounded-xl hover:bg-gray-100 transition-all"
            >
                <span className="truncate">{currentStatus}</span>
                <img
                    src={Icons.auth.arrow}
                    className={`w-2.5 ml-2 opacity-40 transition-transform ${isOpen ? "rotate-180" : ""}`}
                    alt="arrow"
                />
            </button>

            {isOpen && (
                <div className="absolute right-0 z-30 mt-2 w-40 bg-white rounded-2xl shadow-[0px_10px_30px_rgba(0,0,0,0.1)] border border-gray-100 overflow-hidden animate-in fade-in zoom-in duration-200">
                    {options.map((option) => (
                        <button
                            key={option}
                            onClick={() => {
                                onStatusChange?.(option);
                                setIsOpen(false);
                            }}
                            className="w-full text-left px-4 py-3 text-xs text-gray-600 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
                        >
                            {option}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default StatusDropdown;