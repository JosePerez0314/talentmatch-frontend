import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Sidebar = () => {
    const navigate = useNavigate();
    // Empezamos con el menú cerrado (false) para que no se vea nada al inicio
    const [isOpen, setIsOpen] = useState(false);

    const handleLogout = () => {
        navigate("/login");
    };

    const menuItems = [
        { name: "Dashboard", active: true },
        { name: "Crear Posición", active: false },
        { name: "Subir CVs", active: false },
        { name: "Crear Vacante", active: false },
        { name: "Historial de CVs", active: false },
        { name: "Historial de anuncios", active: false },
        { name: "Historial de Posiciones", active: false },
        { name: "Resultados", active: false },
    ];

    return (
        <>
            {/* 1. BOTÓN DE LAS 3 BARRITAS: Siempre visible y fijo */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed top-8 left-8 z-[60] flex flex-col justify-center items-center w-10 h-10 rounded-lg hover:bg-white shadow-sm transition-all gap-1.5">
                <span className={`h-0.5 bg-gray-600 rounded-full transition-all duration-300 ${isOpen ? "w-6 rotate-45 translate-y-2" : "w-6"}`}></span>
                <span className={`h-0.5 bg-gray-600 rounded-full transition-all duration-300 ${isOpen ? "opacity-0" : "w-6"}`}></span>
                <span className={`h-0.5 bg-gray-600 rounded-full transition-all duration-300 ${isOpen ? "w-6 -rotate-45 -translate-y-2" : "w-6"}`}></span>
            </button>

            {/* 2. FONDO OSCURO (Overlay): Aparece solo cuando el menú se abre */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/10 backdrop-blur-[2px] z-40 transition-opacity"
                    onClick={() => setIsOpen(false)}>
                </div>
            )}

            {/* 3. EL MENÚ: Solo aparece al dar clic */}
            <aside
                className={`fixed top-0 left-0 h-screen bg-white z-50 shadow-2xl transition-transform duration-300 ease-in-out flex flex-col justify-between py-6
                ${isOpen ? "translate-x-0 w-64" : "-translate-x-full w-64"}`}>
                <div className="mt-16"> {/* Espacio para que no choque con el botón */}
                    <div className="px-8 mb-10 flex items-center">
                        <span className="text-sm font-bold text-[#447ECA] tracking-tight">
                            TALENTMATCH AI
                        </span>
                    </div>

                    <nav className="flex flex-col gap-1 px-4">
                        {menuItems.map((item) => (
                            <button
                                key={item.name}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all whitespace-nowrap
                                    ${item.active ? "bg-[#DCF9FF] text-[#447ECA]" : "text-gray-500 hover:bg-gray-50"}`}>
                                {item.name}
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="px-4 border-t border-gray-50 pt-4">
                    <button
                        onClick={handleLogout}
                        className="flex items-center justify-center gap-3 px-4 py-3 w-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all text-sm font-medium border border-gray-100 rounded-lg overflow-hidden">
                        <span>Cerrar sesión</span>
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;