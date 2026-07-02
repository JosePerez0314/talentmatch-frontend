import React, { useState } from "react";
import { useNavigate, NavLink, Link } from "react-router-dom";

//Assets
import { Icons } from "../assets/icons/index";
//Components
import { useAuth } from "../components/context/AuthContext";

//TIPADOS
interface MenuItem {
    name: string;
    icon: string;
    path: string;
    isDynamic?: boolean;
}

interface MenuSection {
    title: string | null;
    items: MenuItem[];
}

//CONFIGURACIÓN DEL MENÚ
const MENU_GROUPS: MenuSection[] = [
    {
        title: null,
        items: [
            { name: "Dashboard", icon: Icons.sidebar.dashboard, path: "/dashboard" },
        ],
    },
    {
        title: "ACCIONES RÁPIDAS",
        items: [
            { name: "Nueva Posición", icon: Icons.sidebar.positionCreate, path: "/position" },
            { name: "Añadir Candidato", icon: Icons.sidebar.uploadCv, path: "/uploadcv" },
            { name: "Nueva Vacante", icon: Icons.sidebar.vacant, path: "/vacancy" },
            { name: "Nuevo Departamento", icon: Icons.sidebar.departament, path: "/department" },
        ],
    },
    {
        title: "REGISTROS",
        items: [
            { name: "Posiciones", icon: Icons.sidebar.historyPosition, path: "/position-history" },
            { name: "Candidatos", icon: Icons.sidebar.candidates, path: "/candidates-history" },
            { name: "Vacantes", icon: Icons.sidebar.historyVacant, path: "/vacancy-history" },
            { name: "Departamentos", icon: Icons.sidebar.layersHisDepart, path: "/department-history" },
        ],
    },
    {
        title: "ANÁLISIS",
        items: [
            { name: "Evaluaciones", icon: Icons.sidebar.trophy, path: "/evaluations-history", isDynamic: true },
        ],
    },
    {
        title: "CONFIGURACIÓN",
        items: [
            { name: "Administración", icon: Icons.sidebar.dashboard, path: "/admin" },
        ],
    }
];

const Sidebar: React.FC = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    // Defecto abierto
    const [isExpanded, setIsExpanded] = useState<boolean>(true);

    const lastVacancyId = localStorage.getItem("lastVacancyId");

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const toggleSidebar = () => setIsExpanded(!isExpanded);

    // Extrae user e inicial 
    const displayName = user?.username || "admin";
    const initialLetter = displayName.charAt(0).toUpperCase();

    return (
        <aside
            className={`flex flex-col bg-white border-r border-gray-100 h-screen transition-all duration-300 ease-in-out shrink-0 z-50
            ${isExpanded ? "w-72" : "w-20"}`}
        >
            {/* TOP HEADER Logo y Botón  */}
            <div className={`h-16 flex items-center border-b border-transparent shrink-0 px-5 
                ${isExpanded ? "justify-between" : "justify-center"}`}>

                {isExpanded && (
                    <Link to="/dashboard" className="hover:opacity-80 transition-opacity">
                        <img
                            src={Icons.logos.small}
                            alt="TalentMatch AI"
                            className="h-8 w-auto object-contain"
                        />
                    </Link>
                )}

                <button
                    onClick={toggleSidebar}
                    className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 focus:outline-none"
                    title={isExpanded ? "Colapsar menú" : "Expandir menú"}
                >
                    <img
                        src={isExpanded ? Icons.sidebar.panelClose : Icons.sidebar.panelOpen}
                        alt="Toggle Sidebar"
                        className="w-5 h-5 opacity-60"
                    />
                </button>
            </div>

            {/* NAVEGACIÓN */}
            <div className="flex-1 overflow-y-auto custom-scrollbar py-6 px-4 space-y-8">
                {MENU_GROUPS.map((group, groupIndex) => (
                    <div key={groupIndex} className="flex flex-col gap-1">

                        {/* HEADER */}
                        {group.title && isExpanded && (
                            <h3 className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                                {group.title}
                            </h3>
                        )}
                        {/* Separador sutil para modo colapsado */}
                        {group.title && !isExpanded && (
                            <div className="w-8 h-px bg-gray-100 mx-auto mb-2 mt-4"></div>
                        )}

                        {/* ITEMS DEL GRUPO */}
                        {group.items.map((item) => {
                            const finalPath = (item.isDynamic && lastVacancyId)
                                ? `${item.path}/${lastVacancyId}`
                                : item.path;

                            return (
                                <NavLink
                                    key={item.name}
                                    to={finalPath}
                                    className={({ isActive }) => `
                                        relative flex items-center rounded-xl font-medium transition-all group
                                        ${isExpanded ? "px-3 py-2.5 gap-3 text-sm" : "justify-center p-3 w-12 h-12 mx-auto"}
                                        ${isActive
                                            ? "bg-[#EAF7FF] text-[#447ECA]"
                                            : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                                        }
                                    `}
                                    title={!isExpanded ? item.name : undefined}
                                >
                                    {({ isActive }) => (
                                        <>
                                            <img
                                                src={item.icon}
                                                alt=""
                                                className={`object-contain transition-all duration-300
                                                    ${isExpanded ? "w-5 h-5" : "w-6 h-6"}
                                                    ${isActive ? "opacity-100" : "opacity-50 grayscale"}`}
                                                style={isActive && !item.icon.includes('blue') ? { filter: 'invert(46%) sepia(48%) saturate(545%) hue-rotate(174deg) brightness(92%) contrast(90%)' } : {}}
                                            />

                                            {isExpanded && (
                                                <span className="whitespace-nowrap transition-opacity duration-300">
                                                    {item.name}
                                                </span>
                                            )}

                                            {/* PUNTO AZUL INDICADOR Solo en modo expandido */}
                                            {isActive && isExpanded && (
                                                <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-[#447ECA]"></div>
                                            )}
                                        </>
                                    )}
                                </NavLink>
                            );
                        })}
                    </div>
                ))}
            </div>

            {/* FOOTER SIDEBAR */}
            <div className="shrink-0 border-t border-gray-100 p-5">
                {isExpanded ? (
                    <div className="flex flex-col gap-4">
                        {/* User Row */}
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-[#447ECA] text-white flex items-center justify-center font-bold text-sm shrink-0">
                                {initialLetter}
                            </div>
                            <span className="text-base font-medium text-[#447ECA] truncate">
                                {displayName}
                            </span>
                        </div>

                        {/* Row Log Out */}
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 w-full text-gray-500 hover:text-gray-800 hover:bg-gray-50 p-2 -ml-2 rounded-xl transition-colors group"
                            title="Cerrar sesión"
                        >
                            <img
                                src={Icons.auth.logOut}
                                alt="Logout"
                                className="w-5 h-5 opacity-60 group-hover:opacity-100 transition-all"
                            />
                            <span className="text-sm font-medium">Cerrar sesión</span>
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={handleLogout}
                        className="w-12 h-12 mx-auto flex items-center justify-center rounded-xl bg-gray-50 hover:bg-red-50 group transition-colors"
                        title="Cerrar sesión"
                    >
                        <img
                            src={Icons.auth.logOut}
                            alt="Logout"
                            className="w-5 h-5 opacity-50 group-hover:opacity-100 transition-all"
                            style={{ filter: 'grayscale(1)' }}
                        />
                    </button>
                )}
            </div>
        </aside>
    );
};

export default Sidebar;