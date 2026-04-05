import React from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";

// Assets
import { Icons } from "../assets/icons";

const Layout = ({ children }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    return (
        <div className="flex h-screen bg-[#F0F0F5] font-sans overflow-hidden text-left">
            <Sidebar />

            <div className="flex flex-col flex-1 min-w-0">
                <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-end px-8 z-20 shadow-sm shrink-0">
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

                <main className="flex-1 overflow-y-auto p-0 relative">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;