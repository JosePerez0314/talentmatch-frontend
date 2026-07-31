import React, { useState } from "react";
import { useNavigate, NavLink, Link } from "react-router-dom";
import { Shield, PanelLeftClose, PanelLeftOpen, LogOut } from "lucide-react";

// Assets
import { Icons } from "../assets/icons/index";
// Components
import { useAuth } from "../components/context/AuthContext";

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
}

const ADMIN_PANEL_ITEM: MenuItem = { name: "Panel Admin", icon: Shield, path: "/admin" };

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
            { name: "Nueva Posición",     icon: Icons.sidebar.positionCreate, path: "/position" },
            { name: "Nueva Vacante",      icon: Icons.sidebar.vacant,         path: "/vacancy" },
            { name: "Nuevo Departamento", icon: Icons.sidebar.departament,    path: "/department" },
        ],
    },
    {
        title: "REGISTROS",
        items: [
            { name: "Posiciones",    icon: Icons.sidebar.historyPosition,  path: "/position-history" },
            { name: "Candidatos",   icon: Icons.sidebar.candidates,        path: "/candidates-history" },
            { name: "Vacantes",     icon: Icons.sidebar.historyVacant,     path: "/vacancy-history" },
            { name: "Departamentos", icon: Icons.sidebar.layersHisDepart,  path: "/department-history" },
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

    // Resolución segura del nombre y la inicial (Defensive Programming)
    const displayName = user?.username || (user as any)?.name || user?.email?.split('@')[0] || "Administrador";
    // Garantizamos que charAt(0) no lance error si por algún motivo extremo el string llega vacío
    const initialLetter = displayName ? displayName.charAt(0).toUpperCase() : "A";

    return (
        <aside
            className={`flex flex-col bg-white border-r border-gray-100 h-screen transition-all duration-300 ease-in-out shrink-0 z-50
            ${isExpanded ? "w-56" : "w-[60px]"}`}
        >
            {/* Header */}
            <div className={`h-14 flex items-center border-b border-gray-100 shrink-0 px-3 gap-2 overflow-hidden
                ${isExpanded ? "justify-between" : "justify-center"}`}>

                {isExpanded && (
                    <Link to="/dashboard" className="flex-1 min-w-0 hover:opacity-80 transition-opacity">
                        <img
                            src={Icons.logos.small}
                            alt="TalentMatch AI"
                            className="h-7 object-contain object-left"
                        />
                    </Link>
                )}

                <button
                    onClick={toggleSidebar}
                    className="flex-shrink-0 p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors focus:outline-none"
                    title={isExpanded ? "Colapsar menú" : "Expandir menú"}
                >
                    {isExpanded
                        ? <PanelLeftClose size={17} />
                        : <PanelLeftOpen size={17} />
                    }
                </button>
            </div>

            {/* Nav */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar py-3">
                {MENU_GROUPS.map((group, groupIndex) => {
                    const items = groupIndex === 0 && user?.role === "ADMIN"
                        ? [...group.items, ADMIN_PANEL_ITEM]
                        : group.items;

                    return (
                        <div key={groupIndex} className={groupIndex > 0 ? "mt-1" : ""}>

                            {/* Section heading — expanded */}
                            {group.title && isExpanded && (
                                <h3 className={`px-4 pt-3 pb-1 text-[10px] uppercase tracking-widest flex items-center gap-1.5 select-none ${group.titleClassName || "text-gray-400"}`}>
                                    {group.icon && (
                                        typeof group.icon === "string" ? (
                                            <img
                                                src={group.icon}
                                                alt=""
                                                className="w-3.5 h-3.5 object-contain"
                                                style={{ filter: 'invert(46%) sepia(48%) saturate(545%) hue-rotate(174deg) brightness(92%) contrast(90%)' }}
                                            />
                                        ) : (
                                            React.createElement(group.icon, { className: "w-3.5 h-3.5 text-[#447ECA]" })
                                        )
                                    )}
                                    <span>{group.title}</span>
                                </h3>
                            )}

                            {/* Section divider — collapsed */}
                            {group.title && !isExpanded && (
                                <div className="mx-3 my-2 border-t border-gray-100" />
                            )}

                            {/* Items */}
                            {items.map((item) => {
                                const finalPath = (item.isDynamic && lastVacancyId)
                                    ? `${item.path}/${lastVacancyId}`
                                    : item.path;

                                return (
                                    <NavLink
                                        key={item.name}
                                        to={finalPath}
                                        title={!isExpanded ? item.name : undefined}
                                        className={({ isActive }) => `
                                            relative flex items-center gap-3 mx-2 my-0.5 rounded-lg transition-colors
                                            ${isExpanded ? "px-3 py-2.5 text-sm" : "justify-center p-3"}
                                            ${isActive
                                                ? "bg-[#DCF9FF] text-[#447ECA]"
                                                : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                                            }
                                        `}
                                    >
                                        {({ isActive }) => (
                                            <>
                                                {typeof item.icon === "string" ? (
                                                    <img
                                                        src={item.icon}
                                                        alt=""
                                                        className="w-[17px] h-[17px] object-contain flex-shrink-0 transition-all duration-300"
                                                        style={isActive
                                                            ? (!item.icon.includes('blue') ? { filter: 'invert(46%) sepia(48%) saturate(545%) hue-rotate(174deg) brightness(92%) contrast(90%)' } : {})
                                                            : { filter: 'grayscale(1)', opacity: 0.5 }
                                                        }
                                                    />
                                                ) : (
                                                    React.createElement(item.icon, {
                                                        className: `w-[17px] h-[17px] flex-shrink-0 transition-all duration-300
                                                            ${isActive ? "text-[#447ECA]" : "text-gray-400 group-hover:text-gray-600"}`
                                                    })
                                                )}

                                                {isExpanded && (
                                                    <span className="whitespace-nowrap transition-opacity duration-300">
                                                        {item.name}
                                                    </span>
                                                )}

                                                {isActive && isExpanded && (
                                                    <span className="ml-auto w-1.5 h-1.5 rounded-full flex-shrink-0 bg-[#447ECA]" />
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

            {/* Footer */}
            <div className={`shrink-0 border-t border-gray-100 ${isExpanded ? "p-3 space-y-1" : "p-2 space-y-1"}`}>
                {isExpanded && (
                    <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg">
                        <div
                            className="w-6 h-6 rounded-full flex items-center justify-center text-xs text-white flex-shrink-0"
                            style={{ backgroundColor: '#447ECA' }}
                        >
                            {initialLetter}
                        </div>
                        <span className="text-xs text-gray-600 truncate">{displayName}</span>
                    </div>
                )}

                {isExpanded ? (
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 w-full px-2 py-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors text-sm"
                        title="Cerrar sesión"
                    >
                        <LogOut size={15} />
                        <span>Cerrar sesión</span>
                    </button>
                ) : (
                    <button
                        onClick={handleLogout}
                        className="flex justify-center w-full p-2.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        title="Cerrar sesión"
                    >
                        <LogOut size={15} />
                    </button>
                )}
            </div>
        </aside>
    );
};

export default Sidebar;
