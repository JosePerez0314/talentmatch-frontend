import React from "react";
import Sidebar from "../components/Sidebar";

const Dashboard = () => {
    // ESTA ES LA ZONA DONDE SE CONECTARÁ EL BACKEND
    const stats = [
        { title: "Posiciones creadas", count: 0, btn: "Crear Posiciones" },
        { title: "CVs subidos", count: 0, btn: "Subir CV" },
        { title: "Vacantes activas", count: 0, btn: "Crear Vacantes" }
    ];

    const lastMovements = {
        posicion: "Sin posiciones",
        cv: "N/A",
        cerradas: 0
    };

    return (
        <div className="flex min-h-screen bg-[#F0F0F5]">
            <Sidebar />

            <main className="flex-1 p-10 overflow-y-auto">
                {/* Encabezado */}
                <header className="flex justify-center mb-10">
                    <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Dashboard - Centro de Control</h1>
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-400">
                    </div>
                </header>

                {/* Grid Superior: Estadísticas en 0 */}
                <div className="grid grid-cols-1 gap-6 mb-8">
                    {stats.map((item, index) => (
                        <div key={index} className="bg-white p-6 rounded-[12px] shadow-sm border border-[#DCF9FF] flex justify-between items-center transition-all hover:shadow-md">
                            <div className="flex items-center gap-6">
                                {/* Espacio para el icono que pondrá después */}
                                <div className="w-16 h-16 bg-[#DCF9FF] rounded-2xl flex items-center justify-center">
                                    <div className="w-6 h-6 bg-[#447ECA]/10 rounded-full"></div>
                                </div>
                                <div>
                                    <p className="text-sm text-black font-medium">{item.title}</p>
                                    <p className="text-3xl font-extrabold text-black tracking-tight">
                                        {item.count}
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <button className="px-6 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-50 transition-all">
                                    Ver
                                </button>
                                <button className="bg-[#447ECA] text-white px-8 py-2.5 rounded-xl text-[13px] font-bold hover:bg-[#3669ab] transition-all shadow-sm active:scale-95">
                                    {item.btn}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Grid Inferior: Últimos movimientos con Grid Repeat */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div className="bg-white p-7 rounded-[20px] shadow-sm border border-white text-center">
                        <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest italic">Última posición creada</p>
                        <p className="text-[#447ECA] font-bold mt-2 text-sm">{lastMovements.posicion}</p>
                    </div>
                    <div className="bg-white p-7 rounded-[20px] shadow-sm border border-white text-center">
                        <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest italic">Último CV subido</p>
                        <p className="text-[#447ECA] font-bold mt-2 text-sm">{lastMovements.cv}</p>
                    </div>
                    <div className="bg-white p-7 rounded-[20px] shadow-sm border border-white text-center">
                        <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest italic">Vacantes cerradas</p>
                        <p className="text-[#447ECA] font-bold mt-2 text-sm">{lastMovements.cerradas}</p>
                    </div>
                </div>

                {/* Sección de CTA/ llamado a la accion*/}
                <div className="bg-[#DCF9FF] p-12 rounded-[20px] text-center border border-[#447ECA]/5">
                    <p className="text-[#447ECA] font-semibold text-lg mb-8 italic">
                        "¿Listo para encontrar tu próximo talento? Crea una vacante y deja que la IA haga el trabajo."
                    </p>
                    <button className="bg-[#447ECA] text-white px-12 py-4 rounded-xl font-bold shadow-lg hover:bg-[#3669ab] transition-all active:scale-95">
                        Crear Vacante ahora
                    </button>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;