import React from "react";
import { useEffect, useState } from "react";
//Components
import StatCard from "../components/cards/StatCard";
import MovementCard from "../components/cards/MovementCard";
//Config dashboard
import { STATS_CONFIG, INITIAL_METRICS, INITIAL_MOVEMENTS } from "../utils/dashboardConfig";

const Dashboard = () => {
  // 1. STATE MANAGEMENT
  const [metrics, setMetrics] = useState(INITIAL_METRICS);
  const [lastMovements, setLastMovements] = useState(INITIAL_MOVEMENTS);
  const [isLoading, setIsLoading] = useState(true);

  // 2. DATA FETCHING
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Simulation of API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        setMetrics({ posiciones: 12, cvs: 45, vacantes: 3 });
        setLastMovements({
          posicion: "Desarrollador React",
          cv: "juan_perez.pdf",
          cerradas: 2,
        });
      } catch (error) {
        console.error("Critical error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    /* AJUSTES RESPONSIVE:
       - p-4 en móvil para evitar desbordes, md:p-10 en escritorio.
       - max-w-5xl para dar un poco más de aire a las tarjetas.
    */
    <div className="p-4 md:p-10 animate-fade-in">
      <div className="max-w-5xl mx-auto">

        {/* Page Header - Texto más pequeño en móvil para evitar saltos de línea */}
        <header className="mb-8 md:mb-10 px-2 md:px-4 text-left">
          <h1 className="text-xl md:text-2xl font-bold text-gray-800 tracking-tight">
            Dashboard - Centro de Control
          </h1>
        </header>

        {/* Top Grid: Statistics Section */}
        <section className="grid grid-cols-1 gap-6 mb-8 px-2 md:px-4">
          {STATS_CONFIG.map((config) => (
            <StatCard
              key={config.id}
              title={config.title}
              icon={config.icon}
              count={metrics[config.id]}
              btnText={config.btn}
              btnIcon={config.btnIcon}
              actionPath={config.actionPath}
              viewPath={config.viewPath}
            />
          ))}
        </section>

        {/* Bottom Grid: Recent Activity Section */}
        {/* grid-cols-1 asegura que en móvil se apilen verticalmente */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 px-2 md:px-4">
          <MovementCard
            title="Última posición creada"
            value={lastMovements.posicion}
          />
          <MovementCard
            title="Último CV subido"
            value={lastMovements.cv}
          />
          <MovementCard
            title="Vacantes cerradas"
            value={lastMovements.cerradas}
          />
        </section>

        {/* CTA Section: IA Vacancy Creation */}
        <section className="px-2 md:px-4">
          {/* p-8 en móvil para que el texto no choque con los bordes */}
          <div className="bg-[#DCF9FF] p-8 md:p-12 rounded-[24px] text-center border border-[#447ECA]/10">
            <p className="text-[#447ECA] font-semibold text-base md:text-lg mb-6 md:mb-8 italic">
              ¿Listo para encontrar tu próximo talento? Crea una vacante y deja
              que la IA haga el trabajo.
            </p>
            {/* Botón w-full en móvil para mejor UX táctil */}
            <button className="w-full md:w-auto bg-[#447ECA] text-white px-12 py-4 rounded-xl font-bold shadow-lg hover:bg-[#3669ab] transition-all active:scale-95">
              Crear Vacante ahora
            </button>
          </div>
        </section>

      </div>
    </div>
  );
};

export default Dashboard;

