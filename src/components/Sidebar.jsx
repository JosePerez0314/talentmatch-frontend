import React, { useState } from "react";
//Liks
import { useNavigate, NavLink } from "react-router-dom"; 


//Assets
import logoSmall from "../assets/icons/Logo_TalentMatch_AI_Small.svg"
import iconDashboard from "../assets/icons/icon_dashboard.svg";
import iconPositionCreateSlide from "../assets/icons/icon_position_create_slide.svg";
import iconUploadCvSlide from "../assets/icons/icon_upload_cv_slide.svg";
import iconVacantCreate from "../assets/icons/icon_vacant_create.svg";
import iconEyeHistory from "../assets/icons/icon_eye_history.svg";
import iconHistoryVacant from "../assets/icons/icon_history_vacant.svg";
import iconHistoryPosition from "../assets/icons/icon_history_position.svg";
import iconResultsTrophy from "../assets/icons/icon_results_trophy.svg";

const Sidebar = () => {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);

    const handleLogout = () => {
        navigate("/login");
    };

    // Add the 'path' property to define where each menu item should redirect
    const menuItems = [
        { name: "Dashboard", icon: iconDashboard, path: "/dashboard" },
        { name: "Crear Posición", icon: iconPositionCreateSlide, path: "/position" },
        { name: "Subir CVs", icon: iconUploadCvSlide, path: "/upload" },
        { name: "Crear Vacante", icon: iconVacantCreate, path: "/create-vacant" },
        { name: "Historial de CVs", icon: iconEyeHistory, path: "/cv-history" },
        { name: "Historial de anuncios", icon: iconHistoryVacant, path: "/ads-history" },
        { name: "Historial de Posiciones", icon: iconHistoryPosition, path: "/position-history" },
        { name: "Resultados", icon: iconResultsTrophy, path: "/results" },
    ];

    return (
        <>
            {/* HAMBURGER BUTTON */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed top-8 left-8 z-[60] flex flex-col justify-center items-center w-10 h-10 rounded-lg bg-white/80 backdrop-blur-sm hover:bg-white shadow-sm transition-all gap-1.5">
                <span className={`h-0.5 bg-gray-600 rounded-full transition-all duration-300 ${isOpen ? "w-6 rotate-45 translate-y-2" : "w-6"}`}></span>
                <span className={`h-0.5 bg-gray-600 rounded-full transition-all duration-300 ${isOpen ? "opacity-0" : "w-6"}`}></span>
                <span className={`h-0.5 bg-gray-600 rounded-full transition-all duration-300 ${isOpen ? "w-6 -rotate-45 -translate-y-2" : "w-6"}`}></span>
            </button>

            {/* OVERLAY */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/10 backdrop-blur-[2px] z-40 transition-opacity"
                    onClick={() => setIsOpen(false)}>
                </div>
            )}

            {/* SIDEBAR MENU */}
            <aside
                className={`fixed top-0 left-0 h-screen bg-white z-50 shadow-2xl transition-transform duration-300 ease-in-out flex flex-col justify-between py-6
                ${isOpen ? "translate-x-0 w-64" : "-translate-x-full w-64"}`}>
                <div className="mt-16">
                    {/* Logo */}
                    <div className="px-8 mb-10 flex items-center">
                        <img src={logoSmall} alt="TalentMatch AI Logo" className="h-10 w-auto object-contain" />
                    </div>

                    <nav className="flex flex-col gap-1 px-4">
                        {menuItems.map((item) => (
                            <NavLink
                                key={item.name}
                                to={item.path}
                                onClick={() => setIsOpen(false)} // Close the menu when navigating
                                className={({ isActive }) => `
                                    flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap
                                    ${isActive
                                        ? "bg-[#DCF9FF] text-[#447ECA]"
                                        : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"}
                                `}>
                                {({ isActive }) => (
                                    <>
                                        <img
                                            src={item.icon}
                                            alt=""
                                            className={`h-5 w-5 object-contain transition-all
                                                ${isActive ? "opacity-100" : "opacity-60 grayscale-[0.5]"}`} />
                                        <span>{item.name}</span>
                                    </>
                                )}
                            </NavLink>
                        ))}
                    </nav>
                </div>

                {/* SIDEBAR FOOTER */}
                <div className="px-4 border-t border-gray-50 pt-4">
                    <button
                        onClick={handleLogout}
                        className="flex items-center justify-center gap-3 px-4 py-3 w-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all text-sm font-bold border border-gray-100 rounded-lg">
                        <span>Cerrar sesión</span>
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;