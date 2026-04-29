import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// Components
import StatCard from "../components/cards/StatCard";
import MovementCard from "../components/cards/MovementCard";

// Config dashboard
import { STATS_CONFIG, INITIAL_METRICS, INITIAL_MOVEMENTS } from "../utils/dashboardConfig";

// API and Assets
import { dashboardService } from "../services/api/dashboard.api";
import { Icons } from "../assets/icons";

const Dashboard = () => {
  // STATE MANAGEMENT
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState(INITIAL_METRICS);
  const [lastMovements, setLastMovements] = useState(INITIAL_MOVEMENTS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // DATA FETCHING WITH POLLING (Real-Time)
  useEffect(() => {
    // Parameter isInitial to avoid flicker
    const fetchDashboardData = async (isInitial) => {
      if (isInitial) {
        setIsLoading(true);
      }

      try {
        const data = await dashboardService.getSummary();

        // VALIDACIÓN: Solo actualizamos si recibimos datos válidos
        if (data) {
          setMetrics({
            posiciones: data.positionsCount || data.posiciones || 0,
            cvs: data.cvsCount || data.cvs || 0,
            vacantes: data.activeVacancies || data.vacantes || 0,
          });

          setLastMovements({
            posicion: data.lastPosition?.title || data.lastPosition || "Sin datos",
            cv: data.lastCv?.title || data.lastCv || "Sin datos",
            cerradas: data.closedVacancies || 0,
          });

          // Limpiamos errores previos si la conexión fue exitosa
          setError(null);
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Problemas de conexión sincronizando métricas en tiempo real.");
      } finally {
        if (isInitial) {
          setIsLoading(false);
        }
      }
    };

    // Ejecución inicial
    fetchDashboardData(true);

    // Configuración de Polling (30 segundos) para mantener datos frescos de Railway
    const POLLING_INTERVAL = 30000;
    const intervalId = setInterval(() => {
      fetchDashboardData(false);
    }, POLLING_INTERVAL);

    // Cleanup: Evita memory leaks al salir de la página
    return () => clearInterval(intervalId);
  }, []);

  // RENDERIZADO DE CARGA INICIAL
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

        {/* Manejo de errores visuales */}
        {error && (
          <div className="mb-6 mx-2 md:mx-4 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-bold border border-red-100 animate-fade-in">
            {error}
          </div>
        )}

        {/* Top Grid: Estadísticas Principales */}
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

        {/* Bottom Grid: Actividad Reciente */}
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

        {/* CTA Section: Creación con IA */}
        <section className="px-2 md:px-4">
          <div className="bg-[#DCF9FF] p-8 md:p-12 rounded-[24px] text-center border border-[#447ECA]/10">
            <p className="text-[#447ECA] font-semibold text-base md:text-lg mb-6 md:mb-8 italic">
              ¿Listo para encontrar tu próximo talento? Crea una vacante y deja
              que la IA haga el trabajo.
            </p>
            <button
              onClick={() => navigate("/vacancy")}
              className="w-full md:w-auto bg-[#447ECA] text-white px-12 py-4 rounded-xl font-bold shadow-lg hover:bg-[#3669ab] transition-all active:scale-95"
            >
              Crear Vacante ahora
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;