import React from "react";
import { useEffect, useState } from "react";
//Components
import StatCard from "../components/cards/StatCard";
import MovementCard from "../components/cards/MovementCard";
//Config dashboard
import { STATS_CONFIG, INITIAL_METRICS, INITIAL_MOVEMENTS } from "../utils/dashboardConfig";

const Dashboard = () => {
  // 1. STATE MANAGEMENT
  // Using centralized initial states from config file
  const [metrics, setMetrics] = useState(INITIAL_METRICS);
  const [lastMovements, setLastMovements] = useState(INITIAL_MOVEMENTS);
  const [isLoading, setIsLoading] = useState(true);

  // 2. DATA FETCHING
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Simulation of API call
        // In the future: const response = await apiService.getMetrics();
        await new Promise((resolve) => setTimeout(resolve, 1000));

        setMetrics({ posiciones: 12, cvs: 45, vacantes: 3 });
        setLastMovements({
          posicion: "Desarrollador React",
          cv: "juan_perez.pdf",
          cerradas: 2,
        });
      } catch (error) {
        console.error("Critical error fetching dashboard data:", error);
        // Error handling logic could go here (e.g., toast notification)
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    /* We remove 'flex' and 'Sidebar' because Dashboard is now
        rendered inside the 'main' tag of Layout.jsx
    */
    <div className="p-10 animate-fade-in">
      <div className="max-w-4xl mx-auto">

        {/* Page Header */}
        <header className="mb-10 px-4">
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">
            Dashboard - Centro de Control
          </h1>
        </header>

        {/* Top Grid: Statistics Section */}
        <section className="grid grid-cols-1 gap-6 mb-8 px-4">
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
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 px-4">
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
        <section className="px-4">
          <div className="bg-[#DCF9FF] p-12 rounded-[20px] text-center border border-[#447ECA]/5">
            <p className="text-[#447ECA] font-semibold text-lg mb-8 italic">
              ¿Listo para encontrar tu próximo talento? Crea una vacante y deja
              que la IA haga el trabajo.
            </p>
            <button className="bg-[#447ECA] text-white px-12 py-4 rounded-xl font-bold shadow-lg hover:bg-[#3669ab] transition-all active:scale-95">
              Crear Vacante ahora
            </button>
          </div>
        </section>

      </div>
    </div>
  );
};

export default Dashboard;

