import React from "react";
import { useNavigate, Link, Outlet } from "react-router-dom"; // 1. Agregamos Outlet
import Sidebar from "./Sidebar";
import { useAuth } from "../components/context/AuthContext";

// Assets
import { Icons } from "../assets/icons";

const Layout = () => { // 2. Ya no necesita { children } si usamos Outlet
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <div className="flex h-screen bg-[#F0F0F5] font-sans overflow-hidden text-left">
            <Sidebar />

            <div className="flex flex-col flex-1 min-w-0">
                {/* HEADER */}
                <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-8 z-20 shadow-sm shrink-0">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-4 ml-10">
                            <Link to="/dashboard" className="cursor-pointer hover:opacity-80 transition-opacity">
                                <img
                                    src={Icons.logos.small}
                                    alt="TalentMatch AI"
                                    className="h-7 w-auto object-contain"
                                />
                            </Link>
                            <span className="text-gray-300 text-xl font-light">-</span>
                            <span className="text-[#447ECA] font-bold text-lg capitalize tracking-tight">
                                {user?.username || "admin"}
                            </span>
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="group flex items-center gap-3 px-5 py-2 border border-gray-200 rounded-xl text-[11px] font-black text-gray-400 hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all uppercase tracking-[0.15em]"
                    >
                        <span>Cerrar</span>
                        <img
                            src={Icons.auth.logOut}
                            alt="Log out"
                            className="w-4 h-4 opacity-50 transition-all group-hover:opacity-100"
                        />
                    </button>
                </header>

                {/* MAIN: Aquí es donde ocurre la magia */}
                <main className="flex-1 overflow-y-auto p-0 relative">
                    {/* 3. Outlet renderiza el Dashboard, Position, etc. */}
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;