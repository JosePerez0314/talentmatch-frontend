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
  { id: "positions",   count: summary.total.positionsCount,    title: "Total Posiciones",      subtext: `${summary.total.positionsCount} en el sistema`,   icon: <Briefcase size={17} strokeWidth={2.5} /> },
  { id: "departments", count: summary.total.departmentsCount,  title: "Departamentos Activos", subtext: `${summary.total.departmentsCount} áreas`,          icon: <BarChart2  size={17} strokeWidth={2.5} /> },
  { id: "candidates",  count: summary.total.candidatesCount,   title: "Candidatos en Pool",    subtext: `${summary.total.candidatesCount} CVs indexados`,   icon: <Users      size={17} strokeWidth={2.5} /> },
  { id: "vacancies",   count: summary.total.openVacanciesCount, title: "Vacantes Abiertas",    subtext: `${summary.total.openVacanciesCount} activas`,      icon: <FileText   size={17} strokeWidth={2.5} /> },
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

  const metrics       = useMemo(() => (summary ? buildMetrics(summary)      : []), [summary]);
  const vacancyStatuses = useMemo(() => (summary ? buildStatusCards(summary) : []), [summary]);
  const monthlyData   = useMemo(() => (summary ? buildMonthlyData(summary)  : []), [summary]);

  const maxYValue = useMemo(() => {
    const values = monthlyData.flatMap((d) => [d.posiciones, d.cvs, d.vacantes]);
    const peak = values.length ? Math.max(...values) : 0;
    return peak > 0 ? peak : 1;
  }, [monthlyData]);

  const getY = (val: number) => 100 - (val / maxYValue) * 100;
  const getX = (index: number) =>
    monthlyData.length > 1 ? (index / (monthlyData.length - 1)) * 100 : 50;

  const ptsPosiciones = monthlyData.map((d, i) => `${getX(i)},${getY(d.posiciones)}`).join(" ");
  const ptsCVs        = monthlyData.map((d, i) => `${getX(i)},${getY(d.cvs)}`).join(" ");
  const ptsVacantes   = monthlyData.map((d, i) => `${getX(i)},${getY(d.vacantes)}`).join(" ");

  // Closing points for area fills (down to y=100, back to origin)
  const areaClose = monthlyData.length > 0
    ? ` ${getX(monthlyData.length - 1)},100 0,100`
    : "";

  const totalVacancies = summary
    ? summary.vacancyStatusBreakdown.reduce((sum, s) => sum + s.count, 0)
    : 0;

  return (
    <div className="p-4 md:p-8 xl:p-10 animate-fade-in w-full h-full flex justify-center">
      <div className="w-full max-w-[1600px]">

        {/* HEADER */}
        <header className="mb-6 xl:mb-8 text-left flex flex-col">
          <h1 className="text-[22px] md:text-2xl xl:text-3xl font-medium text-gray-800 tracking-tight">
            Centro de Observabilidad
          </h1>
          <p className="text-gray-400 text-sm xl:text-base font-medium mt-1">
            Resumen en tiempo real de tu pipeline de talento
          </p>
        </header>

        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="animate-spin text-[#447ECA]" size={32} />
          </div>
        ) : errorMessage ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 text-red-700 text-sm font-semibold p-6">
            {errorMessage}
          </div>
        ) : !summary ? (
          // Empty state
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center"
              style={{ backgroundColor: "#DCF9FF" }}
            >
              <Sparkles size={36} style={{ color: "#447ECA" }} />
            </div>
            <div className="text-center">
              <h2 className="text-gray-800 text-lg mb-2">Sin actividad aún</h2>
              <p className="text-gray-400 text-sm max-w-xs">
                Tu dashboard se activará en cuanto crees tu primera vacante y empieces a recibir candidatos.
              </p>
            </div>
            <button
              onClick={() => navigate("/vacancy")}
              className="flex items-center gap-2 px-6 py-3 text-white rounded-xl text-sm transition-colors"
              style={{ backgroundColor: "#447ECA" }}
              onMouseOver={e => (e.currentTarget.style.backgroundColor = "#3a6bb8")}
              onMouseOut={e => (e.currentTarget.style.backgroundColor = "#447ECA")}
            >
              Empieza hoy y crea tu primera vacante
              <ArrowRight size={15} />
            </button>
          </div>
        ) : (
          <>
            {/* TOP GRID: Metricas */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 xl:gap-6 mb-6 xl:mb-8">
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

            {/* BOTTOM GRID: Graficos */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 xl:gap-6">

              {/* ACTIVITY CHART — 2/3 */}
              <div className="lg:col-span-2 bg-white rounded-[24px] p-5 shadow-sm border border-gray-100 flex flex-col relative">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="text-[#447ECA]" size={16} strokeWidth={2.5} />
                  <h2 className="text-[#1E293B] font-medium text-sm">Actividad Mensual</h2>
                </div>

                {/* Legend */}
                <div className="flex items-center gap-4 mb-3 text-xs font-medium text-gray-400">
                  <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#447ECA]" /> Posiciones</div>
                  <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#96FFC1]" /> CVs</div>
                  <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-gray-400" /> Vacantes</div>
                </div>

                {monthlyData.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center text-xs text-gray-400 font-medium">
                    Sin actividad registrada todavía.
                  </div>
                ) : (
                  <>
                    <div className="relative w-full mt-2 h-[180px] xl:h-[210px] group">
                      {/* Grid lines */}
                      <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                        <div className="border-t border-gray-100 w-full h-0 relative">
                          <span className="absolute -left-5 -top-2 text-[10px] text-gray-300 font-medium">{maxYValue}</span>
                        </div>
                        <div className="border-t border-gray-100 w-full h-0 relative">
                          <span className="absolute -left-5 -top-2 text-[10px] text-gray-300 font-medium">{Math.round(maxYValue / 2)}</span>
                        </div>
                        <div className="border-t border-gray-100 w-full h-0 relative">
                          <span className="absolute -left-5 -top-2 text-[10px] text-gray-300 font-medium">0</span>
                        </div>
                      </div>

                      <svg
                        className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
                        preserveAspectRatio="none"
                        viewBox="0 0 100 100"
                      >
                        {/* Area fills */}
                        <polygon points={`${ptsPosiciones}${areaClose}`} fill="#447ECA" fillOpacity={0.08} stroke="none" />
                        <polygon points={`${ptsCVs}${areaClose}`}        fill="#96FFC1" fillOpacity={0.08} stroke="none" />
                        <polygon points={`${ptsVacantes}${areaClose}`}   fill="#9CA3AF" fillOpacity={0.08} stroke="none" />

                        {/* Lines */}
                        <polyline points={ptsCVs}        fill="none" stroke="#96FFC1" strokeWidth="1.5" />
                        <polyline points={ptsVacantes}   fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeDasharray="2 2" />
                        <polyline points={ptsPosiciones} fill="none" stroke="#447ECA" strokeWidth="2" />
                      </svg>

                      {/* Hover vertical line + DOM dots (avoid SVG distortion from preserveAspectRatio=none) */}
                      {hoveredIndex !== null && (
                        <>
                          <div
                            className="absolute top-0 bottom-0 border-l border-dashed border-gray-300 pointer-events-none"
                            style={{ left: `${getX(hoveredIndex)}%` }}
                          />
                          {[
                            { val: monthlyData[hoveredIndex].posiciones, color: "#447ECA" },
                            { val: monthlyData[hoveredIndex].cvs,        color: "#96FFC1" },
                            { val: monthlyData[hoveredIndex].vacantes,   color: "#9CA3AF" },
                          ].map(({ val, color }) => (
                            <div
                              key={color}
                              className="absolute w-2.5 h-2.5 rounded-full bg-white border-2 pointer-events-none -translate-x-1/2 -translate-y-1/2 z-10"
                              style={{
                                left: `${getX(hoveredIndex)}%`,
                                top:  `${getY(val)}%`,
                                borderColor: color,
                              }}
                            />
                          ))}
                        </>
                      )}

                      {/* Tooltip */}
                      {hoveredIndex !== null && (
                        <div
                          className="absolute z-20 bg-white px-3 py-2 rounded-xl shadow-lg border border-gray-100 pointer-events-none text-xs"
                          style={{
                            left: `${getX(hoveredIndex)}%`,
                            top: "8px",
                            transform: "translateX(-50%)",
                          }}
                        >
                          <p className="text-gray-500 mb-1 font-semibold border-b border-gray-100 pb-1">
                            {monthlyData[hoveredIndex].month}
                          </p>
                          <p style={{ color: "#447ECA" }}>posiciones: <span className="font-medium">{monthlyData[hoveredIndex].posiciones}</span></p>
                          <p style={{ color: "#4ADE80" }}>cvs: <span className="font-medium">{monthlyData[hoveredIndex].cvs}</span></p>
                          <p className="text-gray-500">vacantes: <span className="font-medium">{monthlyData[hoveredIndex].vacantes}</span></p>
                        </div>
                      )}

                      {/* Hover hit areas */}
                      <div className="absolute inset-0 flex">
                        {monthlyData.map((_, i) => (
                          <div
                            key={i}
                            className="flex-1 h-full z-10 cursor-crosshair"
                            onMouseEnter={() => setHoveredIndex(i)}
                            onMouseLeave={() => setHoveredIndex(null)}
                          />
                        ))}
                      </div>
                    </div>

                    {/* X-axis labels */}
                    <div className="flex justify-between text-[10px] font-bold text-gray-300 uppercase mt-2 px-1">
                      {monthlyData.map((d, i) => <span key={`${d.month}-${i}`}>{d.month}</span>)}
                    </div>
                  </>
                )}
              </div>

              {/* VACANCY STATUS — 1/3 */}
              <div className="lg:col-span-1 bg-white rounded-[24px] p-5 shadow-sm border border-gray-100 flex flex-col">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 className="text-[#447ECA]" size={16} strokeWidth={2.5} />
                  <h2 className="text-[#1E293B] font-medium text-sm">Estado de Vacantes</h2>
                </div>

                {vacancyStatuses.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center text-xs text-gray-400 font-medium">
                    Sin vacantes que reportar.
                  </div>
                ) : (
                  <>
                    {/* Stacked proportion bar */}
                    <div className="w-full h-3 flex rounded-full overflow-hidden mb-5 gap-[2px] bg-white">
                      {vacancyStatuses.map(status => (
                        <div key={`top-${status.id}`} className={`h-full ${status.bgClass}`} style={{ width: `${status.percentage}%` }} />
                      ))}
                    </div>

                    <div className="flex flex-col gap-4 flex-1">
                      {vacancyStatuses.map(status => (
                        <div key={`list-${status.id}`} className="flex flex-col gap-1.5">
                          <div className="flex justify-between items-center text-sm font-medium">
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${status.bgClass}`} />
                              <span className="text-gray-600 text-xs">{status.label}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-gray-400 text-xs">{status.percentage}%</span>
                              <span
                                className="px-1.5 py-0.5 rounded text-xs font-bold"
                                style={{
                                  backgroundColor: status.colorHex + "22",
                                  color: status.colorHex === "#F8C807" ? "#856404" : status.colorHex,
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

                    <div className="mt-4 text-center text-gray-400 text-xs font-medium border-t border-gray-50 pt-4">
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
