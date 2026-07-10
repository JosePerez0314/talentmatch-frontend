import React, { useState } from "react";
import { useNavigate, NavLink, Link } from "react-router-dom";
import { Shield } from "lucide-react";

// Assets
import { Icons } from "../assets/icons/index";
// Components
import { useAuth } from "../components/context/AuthContext";

// TIPADOS CORREGIDOS para admitir componentes de íconos
interface MenuItem {
    name: string;
    icon: string | React.ComponentType<{ className?: string }>;
    path: string;
    isDynamic?: boolean;
}

interface MenuSection {
    title: string | null;
    icon?: string | React.ComponentType<{ className?: string }>;
    titleClassName?: string;
    items: MenuItem[];
    requiresAdmin?: boolean;
}

// CONFIGURACIÓN DEL MENÚ
const MENU_GROUPS: MenuSection[] = [
    {
        title: null,
        items: [
            { name: "Dashboard", icon: Icons.sidebar.dashboard, path: "/dashboard" },
        ],
    },
    {
        title: "ADMINISTRACIÓN",
        icon: Shield,
        titleClassName: "text-[#447ECA]",
        requiresAdmin: true,
        items: [
            { name: "Panel Admin", icon: Shield, path: "/admin" },
        ],
    },
    {
        title: "ACCIONES RÁPIDAS",
        items: [
            { name: "Nueva Posición", icon: Icons.sidebar.positionCreate, path: "/position" },
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
            { name: "Evaluaciones", icon: Icons.sidebar.trophy, path: "/evaluations-history" },
        ],
    },
];

const Sidebar: React.FC = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [isExpanded, setIsExpanded] = useState<boolean>(true);

    const lastVacancyId = localStorage.getItem("lastVacancyId");

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const toggleSidebar = () => setIsExpanded(!isExpanded);

    const displayName = user?.username || "Acme Corp";
    const initialLetter = displayName.charAt(0).toUpperCase();

    return (
        <aside
            className={`flex flex-col bg-white border-r border-gray-100 h-screen transition-all duration-300 ease-in-out shrink-0 z-50
            ${isExpanded ? "w-72" : "w-20"}`}
        >
            {/* TOP HEADER Logo y Botón */}
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
                {MENU_GROUPS.map((group, groupIndex) => {
                    if (group.requiresAdmin && user?.role !== "admin") {
                        return null;
                    }

                    return (
                        <div key={groupIndex} className="flex flex-col gap-1">

                            {/* HEADER DE SECCIÓN */}
                            {group.title && isExpanded && (
                                <h3 className={`px-3 mb-2 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 ${group.titleClassName || "text-gray-400"}`}>
                                    {group.icon && (
                                        typeof group.icon === "string" ? (
                                            <img
                                                src={group.icon}
                                                alt=""
                                                className="w-3.5 h-3.5 object-contain"
                                                style={{ filter: 'invert(46%) sepia(48%) saturate(545%) hue-rotate(174deg) brightness(92%) contrast(90%)' }}
                                            />
                                        ) : (
                                            // Usamos React.createElement para renderizar el componente de la librería de forma segura
                                            React.createElement(group.icon, { className: "w-3.5 h-3.5 text-[#447ECA]" })
                                        )
                                    )}
                                    <span>{group.title}</span>
                                </h3>
                            )}

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
                                                {typeof item.icon === "string" ? (
                                                    <img
                                                        src={item.icon}
                                                        alt=""
                                                        className={`object-contain transition-all duration-300
                                                ${isExpanded ? "w-5 h-5" : "w-6 h-6"}
                                                ${isActive ? "opacity-100" : "opacity-50 grayscale"}`}
                                                        style={isActive && !item.icon.includes('blue') ? { filter: 'invert(46%) sepia(48%) saturate(545%) hue-rotate(174deg) brightness(92%) contrast(90%)' } : {}}
                                                    />
                                                ) : (
                                                    // Usamos React.createElement también para los ítems individuales
                                                    React.createElement(item.icon, {
                                                        className: `transition-all duration-300 
                                                ${isExpanded ? "w-5 h-5" : "w-6 h-6"} 
                                                ${isActive ? "text-[#447ECA]" : "text-gray-400 group-hover:text-gray-600"}`
                                                    })
                                                )}

                                                {isExpanded && (
                                                    <span className="whitespace-nowrap transition-opacity duration-300">
                                                        {item.name}
                                                    </span>
                                                )}

                                                {isActive && isExpanded && (
                                                    <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-[#447ECA]"></div>
                                                )}
                                            </>
                                        )}
                                    </NavLink>
                                );
                            })}
                        </div>
                    );
                })}
            </div>

            {/* FOOTER SIDEBAR */}
            <div className="shrink-0 border-t border-gray-100 p-5">
                {isExpanded ? (
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-[#447ECA] text-white flex items-center justify-center font-bold text-sm shrink-0">
                                {initialLetter}
                            </div>
                            <span className="text-base font-medium text-[#447ECA] truncate">
                                {displayName}
                            </span>
                        </div>

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