import React, { useState } from "react";
import { useNavigate, NavLink, Link } from "react-router-dom";

// Assets
import { Icons } from "../assets/icons/index";

const MENU_ITEMS = [
    { name: "Dashboard", icon: Icons.sidebar.dashboard, path: "/dashboard" },
    { name: "Crear Posición", icon: Icons.sidebar.positionCreate, path: "/position" },
    { name: "Subir CVs", icon: Icons.sidebar.uploadCv, path: "/uploadcv" },
    { name: "Crear Vacante", icon: Icons.sidebar.vacant, path: "/vacancy" },
    { name: "Historial de CVs", icon: Icons.sidebar.history, path: "/cv-history" },
    { name: "Historial de Vacantes", icon: Icons.sidebar.historyVacant, path: "/vacancy-history" },
    { name: "Historial de Posiciones", icon: Icons.sidebar.historyPosition, path: "/position-history" },
    { name: "Resultados", icon: Icons.sidebar.trophy, path: "/resultados" },
];

const Sidebar = () => {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);

    // Obtener el último ID visitado para dinamizar el botón de Resultados
    const lastVacancyId = localStorage.getItem("lastVacancyId");

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    const toggleMenu = () => setIsOpen(!isOpen);

    return (
        <>
            {/* HAMBURGER BUTTON */}
            <button
                onClick={toggleMenu}
                aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
                className="fixed top-3 left-4 z-[60] flex flex-col justify-center items-center w-10 h-10 rounded-lg bg-white/80 backdrop-blur-sm hover:bg-white shadow-md transition-all gap-1.5 md:left-6">
                <span className={`h-0.5 bg-gray-600 rounded-full transition-all duration-300 ${isOpen ? "w-6 rotate-45 translate-y-2" : "w-6"}`}></span>
                <span className={`h-0.5 bg-gray-600 rounded-full transition-all duration-300 ${isOpen ? "opacity-0" : "w-6"}`}></span>
                <span className={`h-0.5 bg-gray-600 rounded-full transition-all duration-300 ${isOpen ? "w-6 -rotate-45 -translate-y-2" : "w-6"}`}></span>
            </button>

            { /* OVERLAY */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/15 backdrop-blur-[2px] z-40 transition-opacity animate-fade-in"
                    onClick={() => setIsOpen(false)}
                ></div>
            )}

            <aside
                className={`fixed top-0 left-0 h-screen bg-white z-50 shadow-2xl transition-transform duration-300 ease-in-out flex flex-col justify-between py-6 
                ${isOpen ? "translate-x-0 w-72" : "-translate-x-full w-72"}`}>
                <div className="mt-16 overflow-y-auto custom-scrollbar">
                    <div className="px-8 mb-10">
                        <Link
                            to="/dashboard"
                            className="hover:opacity-80 transition-opacity block cursor-pointer">
                            <img
                                src={Icons.logos.small}
                                alt="TalentMatch AI"
                                className="h-10 w-auto object-contain"
                            />
                        </Link>
                    </div>

                    <nav className="flex flex-col gap-1 px-4">
                        {MENU_ITEMS.map((item) => {
                            // Lógica dinámica para el path de Resultados
                            const finalPath = (item.name === "Resultados" && lastVacancyId)
                                ? `${item.path}/${lastVacancyId}`
                                : item.path;

                            return (
                                <NavLink
                                    key={item.name}
                                    to={finalPath}
                                    onClick={() => setIsOpen(false)}
                                    className={({ isActive }) => `
                                        flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap
                                        ${isActive ? "bg-[#DCF9FF] text-[#447ECA] shadow-sm" : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"}
                                    `}>
                                    {({ isActive }) => (
                                        <>
                                            <img
                                                src={item.icon}
                                                alt=""
                                                className={`h-5 w-5 object-contain transition-all
                                                    ${isActive ? "opacity-100" : "opacity-60 grayscale-[0.5]"}`}
                                            />
                                            <span>{item.name}</span>
                                        </>
                                    )}
                                </NavLink>
                            );
                        })}
                    </nav>
                </div>

                <div className="mt-auto pb-18 md:pb-3 px-4 border-gray-200">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 w-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all text-sm font-bold border border-transparent hover:border-red-100 rounded-xl">
                        <img src={Icons.auth.logOut} alt="" className="w-5 h-5 opacity-50" style={{ filter: 'grayscale(1)' }} />
                        <span>Cerrar sesión</span>
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;