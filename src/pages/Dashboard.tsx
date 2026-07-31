import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BarChart2,
  BarChart3,
  Briefcase,
  FileText,
  Loader2,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import MetricCard from "../components/cards/MetricCard";
import { dashboardService } from "../services/api/dashboard.api";
import {
  DashboardSummary,
  DashboardMetric,
  DashboardVacancyStatusCard,
  MonthlyData,
} from "../types/dashboard.types";
import { VacancyStatus } from "../types/api.types";

const STATUS_LABELS: Record<VacancyStatus, string> = {
  ACTIVE: "Abiertas",
  PAUSED: "Pausadas",
  CLOSED: "Cerradas",
};

const STATUS_COLORS: Record<VacancyStatus, { colorHex: string; bgClass: string }> = {
  ACTIVE: { colorHex: "#447ECA", bgClass: "bg-[#447ECA]" },
  PAUSED: { colorHex: "#F8C807", bgClass: "bg-[#F8C807]" },
  CLOSED: { colorHex: "#EF5050", bgClass: "bg-[#EF5050]" },
};

const MONTH_LABELS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

const toMonthLabel = (yyyyMm: string): string => {
  const [, month] = yyyyMm.split("-");
  const idx = Number(month) - 1;
  return Number.isFinite(idx) && MONTH_LABELS[idx] ? MONTH_LABELS[idx] : yyyyMm;
};

const buildMetrics = (summary: DashboardSummary): DashboardMetric[] => [
  { id: "positions",   count: summary.total.positionsCount,    title: "Total Posiciones",    subtext: `${summary.total.positionsCount} en el sistema`,   icon: <Briefcase size={17} strokeWidth={2.5} /> },
  { id: "departments", count: summary.total.departmentsCount,  title: "Departamentos",       subtext: `${summary.total.departmentsCount} áreas activas`, icon: <BarChart2  size={17} strokeWidth={2.5} /> },
  { id: "candidates",  count: summary.total.candidatesCount,   title: "Candidatos en Pool",  subtext: `${summary.total.candidatesCount} CVs indexados`,  icon: <Users      size={17} strokeWidth={2.5} /> },
  { id: "vacancies",   count: summary.total.openVacanciesCount,title: "Vacantes Abiertas",   subtext: `${summary.total.openVacanciesCount} en curso`,    icon: <FileText   size={17} strokeWidth={2.5} /> },
];

const buildStatusCards = (summary: DashboardSummary): DashboardVacancyStatusCard[] =>
  summary.vacancyStatusBreakdown.map((item) => ({
    id: item.status,
    label: STATUS_LABELS[item.status] ?? item.status,
    percentage: Math.round(item.percentage),
    count: item.count,
    colorHex: STATUS_COLORS[item.status]?.colorHex ?? "#9CA3AF",
    bgClass: STATUS_COLORS[item.status]?.bgClass ?? "bg-gray-400",
  }));

const buildMonthlyData = (summary: DashboardSummary): MonthlyData[] =>
  summary.monthlyActivity.map((item) => ({
    month: toMonthLabel(item.month),
    posiciones: item.positionsCreated,
    cvs: item.cvUploads,
    vacantes: item.vacanciesCreated,
  }));

const METRIC_LINKS: Record<string, string> = {
  positions:   "/position-history",
  departments: "/department-history",
  candidates:  "/candidates-history",
  vacancies:   "/vacancy-history",
};

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [summary, setSummary]           = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading]       = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setIsLoading(true);
        setErrorMessage(null);
        const data = await dashboardService.getSummary();
        if (!cancelled) setSummary(data);
      } catch (err) {
        console.error("Error al cargar el dashboard:", err);
        if (!cancelled) setErrorMessage("No se pudo cargar el resumen del panel.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const metrics         = useMemo(() => (summary ? buildMetrics(summary)      : []), [summary]);
  const vacancyStatuses = useMemo(() => (summary ? buildStatusCards(summary)  : []), [summary]);
  const monthlyData     = useMemo(() => (summary ? buildMonthlyData(summary)  : []), [summary]);

  // FIX
  const renderData = useMemo(() => {
      if (monthlyData.length === 1) {
          // Duplicamos el punto para crear una línea plana (tendencia estática)
          return [monthlyData[0], monthlyData[0]];
      }
      return monthlyData;
  }, [monthlyData]);

  const maxYValue = useMemo(() => {
    const values = renderData.flatMap((d) => [d.posiciones, d.cvs, d.vacantes]);
    const peak = values.length ? Math.max(...values) : 0;
    return peak > 0 ? peak : 1;
  }, [renderData]);

  const getY = (val: number) => 100 - (val / maxYValue) * 100;
  const getX = (index: number) =>
    renderData.length > 1 ? (index / (renderData.length - 1)) * 100 : 50;

  const ptsPosiciones = renderData.map((d, i) => `${getX(i)},${getY(d.posiciones)}`).join(" ");
  const ptsCVs        = renderData.map((d, i) => `${getX(i)},${getY(d.cvs)}`).join(" ");
  const ptsVacantes   = renderData.map((d, i) => `${getX(i)},${getY(d.vacantes)}`).join(" ");

  const areaClose = renderData.length > 0
    ? ` ${getX(renderData.length - 1)},100 0,100`
    : "";

  const totalVacancies = summary
    ? summary.vacancyStatusBreakdown.reduce((sum, s) => sum + s.count, 0)
    : 0;

  return (
    // FIX: Se unificaron los paddings a p-4 md:p-8 eliminando el padding excesivo de pantallas grandes
    <div className="p-4 md:p-8 animate-fade-in w-full h-full flex justify-center">
      <div className="w-full max-w-[1400px]">

        {/* HEADER */}
        <div className="mb-6 md:mb-8 text-left flex flex-col">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
            Centro de Observabilidad
          </h1>
          <p className="text-gray-500 text-sm md:text-base font-medium mt-1">
            Resumen en tiempo real de tu pipeline de talento
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="animate-spin text-[#447ECA]" size={36} />
          </div>
        ) : errorMessage ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 text-red-700 text-sm font-semibold p-6 shadow-sm">
            {errorMessage}
          </div>
        ) : !summary || (metrics.every(m => m.count === 0) && monthlyData.length === 0) ? (
          // Empty state mejorado
          <div className="flex flex-col items-center justify-center min-h-[50vh] gap-5 bg-white rounded-2xl border border-gray-100 shadow-sm p-8 mt-6">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center bg-[#DCF9FF]">
              <Sparkles size={36} className="text-[#447ECA]" />
            </div>
            <div className="text-center">
              <h2 className="text-gray-900 text-xl font-bold mb-2">Sin actividad aún</h2>
              <p className="text-gray-500 text-sm max-w-sm mx-auto leading-relaxed">
                Tu dashboard se activará en cuanto crees tu primera vacante y empieces a recibir candidatos.
              </p>
            </div>
            <button
              onClick={() => navigate("/vacancy")}
              className="mt-2 flex items-center gap-2 px-8 py-3.5 text-white rounded-xl text-sm font-bold bg-[#447ECA] hover:bg-[#3669ab] transition-colors shadow-sm"
            >
              Crea tu primera vacante
              <ArrowRight size={16} />
            </button>
          </div>
        ) : (
          <>
            {/* TOP GRID: Métricas */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
              {metrics.map((metric) => (
                <MetricCard
                  key={metric.id}
                  count={metric.count}
                  title={metric.title}
                  subtext={metric.subtext}
                  icon={metric.icon}
                  to={METRIC_LINKS[metric.id]}
                />
              ))}
            </section>

            {/* BOTTOM GRID: Gráficos */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">

              {/* ACTIVITY CHART — 2/3 */}
              <div className="lg:col-span-2 bg-white rounded-2xl p-5 md:p-6 shadow-sm border border-gray-100 flex flex-col relative">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="text-[#447ECA]" size={18} strokeWidth={2.5} />
                  <h2 className="text-gray-900 font-bold text-base">Actividad Mensual</h2>
                </div>

                {/* Legend */}
                <div className="flex flex-wrap items-center gap-4 mb-4 text-xs font-bold text-gray-500">
                  <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-[#447ECA]" /> Posiciones</div>
                  <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-[#96FFC1]" /> CVs</div>
                  <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-gray-400" /> Vacantes</div>
                </div>

                {renderData.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center text-sm text-gray-400 font-medium py-10">
                    Sin actividad registrada todavía.
                  </div>
                ) : (
                  // FIX: Wrap con scroll horizontal para móviles pequeños
                  <div className="w-full overflow-x-auto custom-scrollbar mt-2">
                    <div className="relative min-w-[500px] h-[180px] xl:h-[220px] group pl-6 pr-4">
                      
                      {/* Grid lines & Y-Axis */}
                      <div className="absolute inset-0 pl-6 flex flex-col justify-between pointer-events-none">
                        <div className="border-t border-gray-100 w-full h-0 relative">
                          <span className="absolute -left-6 -top-2 text-[10px] text-gray-400 font-bold">{maxYValue}</span>
                        </div>
                        <div className="border-t border-gray-100 w-full h-0 relative">
                          <span className="absolute -left-6 -top-2 text-[10px] text-gray-400 font-bold">{Math.round(maxYValue / 2)}</span>
                        </div>
                        <div className="border-t border-gray-100 w-full h-0 relative">
                          <span className="absolute -left-6 -top-2 text-[10px] text-gray-400 font-bold">0</span>
                        </div>
                      </div>

                      {/* SVG Dibuja a partir del padding izquierdo */}
                      <div className="absolute inset-0 pl-6">
                        <svg
                          className="w-full h-full pointer-events-none overflow-visible"
                          preserveAspectRatio="none"
                          viewBox="0 0 100 100"
                        >
                          <polygon points={`${ptsPosiciones}${areaClose}`} fill="#447ECA" fillOpacity={0.08} stroke="none" />
                          <polygon points={`${ptsCVs}${areaClose}`}        fill="#96FFC1" fillOpacity={0.08} stroke="none" />
                          <polygon points={`${ptsVacantes}${areaClose}`}   fill="#9CA3AF" fillOpacity={0.08} stroke="none" />

                          <polyline points={ptsCVs}        fill="none" stroke="#96FFC1" strokeWidth="2" />
                          <polyline points={ptsVacantes}   fill="none" stroke="#9CA3AF" strokeWidth="2" strokeDasharray="4 4" />
                          <polyline points={ptsPosiciones} fill="none" stroke="#447ECA" strokeWidth="2.5" />
                        </svg>

                        {/* Interacciones y Tooltip */}
                        {hoveredIndex !== null && (
                          <>
                            <div
                              className="absolute top-0 bottom-0 border-l-2 border-dashed border-gray-200 pointer-events-none transition-all duration-75"
                              style={{ left: `${getX(hoveredIndex)}%` }}
                            />
                            {[
                              { val: renderData[hoveredIndex].posiciones, color: "#447ECA" },
                              { val: renderData[hoveredIndex].cvs,        color: "#4ADE80" },
                              { val: renderData[hoveredIndex].vacantes,   color: "#9CA3AF" },
                            ].map(({ val, color }) => (
                              <div
                                key={color}
                                className="absolute w-3 h-3 rounded-full bg-white border-[2.5px] pointer-events-none -translate-x-1/2 -translate-y-1/2 z-10 transition-all duration-75 shadow-sm"
                                style={{
                                  left: `${getX(hoveredIndex)}%`,
                                  top:  `${getY(val)}%`,
                                  borderColor: color,
                                }}
                              />
                            ))}

                            <div
                              className="absolute z-20 bg-gray-900 px-4 py-2.5 rounded-xl shadow-xl pointer-events-none text-xs min-w-[120px]"
                              style={{
                                left: `${getX(hoveredIndex)}%`,
                                top: "10px",
                                transform: getX(hoveredIndex) > 80 ? "translateX(-90%)" : getX(hoveredIndex) < 20 ? "translateX(10%)" : "translateX(-50%)",
                              }}
                            >
                              <p className="text-white mb-2 font-bold border-b border-gray-700 pb-1">
                                {renderData[hoveredIndex].month}
                              </p>
                              <p className="text-[#60A5FA] font-medium flex justify-between">Posiciones: <span className="text-white font-bold ml-2">{renderData[hoveredIndex].posiciones}</span></p>
                              <p className="text-[#4ADE80] font-medium flex justify-between">CVs: <span className="text-white font-bold ml-2">{renderData[hoveredIndex].cvs}</span></p>
                              <p className="text-gray-400 font-medium flex justify-between">Vacantes: <span className="text-white font-bold ml-2">{renderData[hoveredIndex].vacantes}</span></p>
                            </div>
                          </>
                        )}

                        <div className="absolute inset-0 flex">
                          {renderData.map((_, i) => (
                            <div
                              key={i}
                              className="flex-1 h-full z-10 cursor-crosshair"
                              onMouseEnter={() => setHoveredIndex(i)}
                              onMouseLeave={() => setHoveredIndex(null)}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* X-axis labels (Basado en renderData para consistencia) */}
                    <div className="flex justify-between text-[11px] font-bold text-gray-400 uppercase mt-3 pl-6 pr-4">
                      {renderData.map((d, i) => (
                        <span key={`lbl-${d.month}-${i}`} className="w-8 text-center -ml-4">{d.month}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* VACANCY STATUS — 1/3 */}
              <div className="lg:col-span-1 bg-white rounded-2xl p-5 md:p-6 shadow-sm border border-gray-100 flex flex-col">
                <div className="flex items-center gap-2 mb-6">
                  <BarChart3 className="text-[#447ECA]" size={18} strokeWidth={2.5} />
                  <h2 className="text-gray-900 font-bold text-base">Estado de Vacantes</h2>
                </div>

                {vacancyStatuses.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center text-sm text-gray-400 font-medium">
                    Sin vacantes que reportar.
                  </div>
                ) : (
                  <>
                    <div className="w-full h-3.5 flex rounded-full overflow-hidden mb-6 bg-gray-100 gap-0.5">
                      {vacancyStatuses.map(status => (
                        <div key={`top-${status.id}`} className={`h-full ${status.bgClass}`} style={{ width: `${status.percentage}%` }} />
                      ))}
                    </div>

                    <div className="flex flex-col gap-4.5 flex-1">
                      {vacancyStatuses.map(status => (
                        <div key={`list-${status.id}`} className="flex flex-col gap-2">
                          <div className="flex justify-between items-center text-sm font-medium">
                            <div className="flex items-center gap-2.5">
                              <div className={`w-2.5 h-2.5 rounded-full ${status.bgClass}`} />
                              <span className="text-gray-700 font-semibold text-sm">{status.label}</span>
                            </div>
                            <div className="flex items-center gap-2.5">
                              <span className="text-gray-400 text-xs font-bold">{status.percentage}%</span>
                              <span
                                className="px-2 py-0.5 rounded-md text-xs font-black"
                                style={{
                                  backgroundColor: status.colorHex + "15",
                                  color: status.colorHex === "#F8C807" ? "#B45309" : status.colorHex,
                                }}
                              >
                                {status.count}
                              </span>
                            </div>
                          </div>
                          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className={`h-full ${status.bgClass} rounded-full`} style={{ width: `${status.percentage}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 text-center text-gray-400 text-xs font-bold uppercase tracking-wider border-t border-gray-100 pt-5">
                      {totalVacancies} vacantes en total
                    </div>
                  </>
                )}
              </div>

            </section>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;