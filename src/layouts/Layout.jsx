import React from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar"; // Se mantiene la importación para renderizarlo, pero sin lógica interna aquí

//Aseets
import { Icons } from "../assets/icons";

const Layout = ({ children }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        navigate("/login");
    };

    return (
        <div className="min-h-screen bg-[#F0F0F5] font-sans flex flex-col">
            {/* HEADER SUPERIOR - Barra blanca fija con acciones de cierre */}
            <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-end px-8 sticky top-0 z-[55] shadow-sm">

                {/* Lado Derecho: Acciones de Sesión */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleLogout}
                        className="px-5 py-2 border border-gray-200 rounded-xl text-[11px] font-black text-gray-400 hover:bg-gray-50 hover:text-red-500 hover:border-red-100 transition-all uppercase tracking-[0.15em]">
                        Cerrar
                    </button>

                    <button
                        onClick={handleLogout}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                        title="Cerrar Sesión">
                    </button>
                </div>
            </header>

            <div className="flex flex-1">
                {/* Renderizamos tu Sidebar (él mismo maneja su estado interno de apertura/cierre) */}
                <Sidebar />

                {/* CONTENIDO DINÁMICO */}
                <main className="flex-1 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;