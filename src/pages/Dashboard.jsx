import React, { useEffect, useState } from "react";
// Components
import StatCard from "../components/cards/StatCard";
import MovementCard from "../components/cards/MovementCard";
// Config dashboard
import { STATS_CONFIG, INITIAL_METRICS, INITIAL_MOVEMENTS } from "../utils/dashboardConfig";
// API and Assets
import { dashboardService } from "../services/api/dashboard.api";
import { Icons } from "../assets/icons";

const Dashboard = () => {
  // 1. STATE MANAGEMENT
  const [metrics, setMetrics] = useState(INITIAL_METRICS);
  const [lastMovements, setLastMovements] = useState(INITIAL_MOVEMENTS);
  
  // ¡Ahora sí le damos uso al isLoading y agregamos manejo de errores!
  const [isLoading, setIsLoading] = useState(true); 
  const [error, setError] = useState(null);

  // 2. DATA FETCHING
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const data = await dashboardService.getSummary();

        if (data) {
          // 1. Mapeo exacto de las tarjetas de arriba
          setMetrics({
            posiciones: data.positionsCount || 0,
            cvs: data.cvsCount || 0,
            vacantes: data.activeVacancies || 0,
          });

          // 2. Mapeo exacto de los movimientos (¡Entrando a .title para evitar el error!)
          setLastMovements({
            posicion: data.lastPosition?.title || "Sin datos",
            cv: data.lastCv?.title || "Sin datos",
            cerradas: data.closedVacancies || 0,
          });
        }
      } catch (err) {
        console.error("Critical error fetching dashboard data:", err);
        setError("No se pudieron cargar las métricas. Por favor, intenta de nuevo.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // 3. RENDERIZADO CONDICIONAL DE CARGA (Resolviendo el comentario del Lead)
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] w-full gap-4 animate-fade-in">
        <img src={Icons.auth.loading} alt="Cargando" className="w-12 h-12 animate-spin opacity-50" />
        <p className="text-gray-500 font-medium tracking-wide">Sincronizando centro de control...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-10 animate-fade-in">
      <div className="max-w-5xl mx-auto">
        
        <header className="mb-8 md:mb-10 px-2 md:px-4 text-left flex flex-col md:flex-row md:justify-between md:items-center">
          <h1 className="text-xl md:text-2xl font-bold text-gray-800 tracking-tight">
            Dashboard - Centro de Control
          </h1>
        </header>

        {/* Manejo de Error Visual */}
        {error && (
          <div className="mb-6 mx-2 md:mx-4 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-bold border border-red-100 animate-fade-in">
            {error}
          </div>
        )}

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
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 px-2 md:px-4">
          <MovementCard
            title="Última posición creada"
            value={lastMovements.posicion}
          />
          <MovementCard title="Último CV subido" value={lastMovements.cv} />
          <MovementCard
            title="Vacantes cerradas"
            value={lastMovements.cerradas}
          />
        </section>

        {/* CTA Section: IA Vacancy Creation */}
        <section className="px-2 md:px-4">
          <div className="bg-[#DCF9FF] p-8 md:p-12 rounded-[24px] text-center border border-[#447ECA]/10">
            <p className="text-[#447ECA] font-semibold text-base md:text-lg mb-6 md:mb-8 italic">
              ¿Listo para encontrar tu próximo talento? Crea una vacante y deja
              que la IA haga el trabajo.
            </p>
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