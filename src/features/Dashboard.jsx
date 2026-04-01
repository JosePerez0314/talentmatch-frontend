// Comentarios en ingles

import React from "react";
import { useEffect, useState } from "react";
//Components
import Sidebar from "../components/Sidebar";
import StatCard from "../components/Dashboard/StatCard";
import MovementCard from "../components/Dashboard/MovementCard";

//Config dashboard
import { STATS_CONFIG } from "../utils/dashboardConfig";


const Dashboard = () => {
  // 1. ESTADO DE DATOS DINÁMICOS (Aquí es donde escribirás los datos de tu API)
  // Inicializamos en 0 / "Cargando..." para que la UI no se rompa antes del fetch
  const [metrics, setMetrics] = useState({
    posiciones: 0,
    cvs: 0,
    vacantes: 0,
  });

  const [lastMovements, setLastMovements] = useState({
    posicion: "Cargando...",
    cv: "Cargando...",
    cerradas: 0,
  });

  // Simulamos la carga
  useEffect(() => {
    // Aquí iría: const data = await apiService.getDashboardData();
    const fetchDashboardData = async () => {
      setTimeout(() => {
        setMetrics({ posiciones: 12, cvs: 45, vacantes: 3 });
        setLastMovements({ posicion: "Desarrollador React", cv: "juan_perez.pdf", cerradas: 2 });
      }, 1000);
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="flex min-h-screen bg-[#F0F0F5]">
      <Sidebar />

      <main className="flex-1 p-10 overflow-y-auto">

        {/* Encabezado Limpio (Sin div vacío) */}
        <header className="flex max-w-4xl mx-auto px-4 mb-10">
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">
            Dashboard - Centro de Control
          </h1>
        </header>

        {/* Grid Superior: Mapeo de Componente Limpio */}
        <div className="grid grid-col-1 md:grid-cols-1 gap-6 mb-8 max-w-4xl mx-auto px-4">
          {STATS_CONFIG.map((config) => (
            <StatCard
              key={config.id}
              title={config.title}
              icon={config.icon}
              count={metrics[config.id]} // Cruzamos el ID estático con el valor del estado dinámico
              btnText={config.btn}
              btnIcon={config.btnIcon}
            />
          ))}
        </div>

        {/* Grid Inferior: Componentes Reutilizables */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 max-w-4xl mx-auto px-4">
          <MovementCard title="Última posición creada" value={lastMovements.posicion} />
          <MovementCard title="Último CV subido" value={lastMovements.cv} />
          <MovementCard title="Vacantes cerradas" value={lastMovements.cerradas} />
        </div>

        {/* Sección de CTA */}
        <div className="bg-[#DCF9FF] p-12 rounded-[20px] text-center border border-[#447ECA]/5 grid-cols-1 gap-6 mb-8 max-w-4xl mx-auto px-4">
          <p className="text-[#447ECA] font-semibold text-lg mb-8 italic">
            ¿Listo para encontrar tu próximo talento? Crea una vacante y deja que la IA haga el trabajo.
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
