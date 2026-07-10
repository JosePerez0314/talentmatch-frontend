import React, { useEffect, useMemo, useState } from "react";
import { Briefcase, BarChart2, Users, FileText, TrendingUp, BarChart3, Loader2 } from "lucide-react";
import MetricCard from "../components/cards/MetricCard";
import { dashboardService } from "../services/api/dashboard.api";
import {
  DashboardSummary,
  DashboardMetric,
  DashboardVacancyStatusCard,
  MonthlyData,
} from "../types/dashboard.types";
import { VacancyStatus } from "../types/api.types";

// GET /api/dashboard returns wire shapes; the UI works with these adapted models.
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
  { id: "positions", count: summary.total.positionsCount, title: "Total Posiciones", subtext: `${summary.total.positionsCount} en el sistema`, icon: <Briefcase size={20} strokeWidth={2.5} /> },
  { id: "departments", count: summary.total.departmentsCount, title: "Departamentos Activos", subtext: `${summary.total.departmentsCount} áreas`, icon: <BarChart2 size={20} strokeWidth={2.5} /> },
  { id: "candidates", count: summary.total.candidatesCount, title: "Candidatos en Pool", subtext: `${summary.total.candidatesCount} CVs indexados`, icon: <Users size={20} strokeWidth={2.5} /> },
  { id: "vacancies", count: summary.total.openVacanciesCount, title: "Vacantes Abiertas", subtext: `${summary.total.openVacanciesCount} activas`, icon: <FileText size={20} strokeWidth={2.5} /> },
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
  positions: "/position-history",
  departments: "/department-history",
  candidates: "/candidates-history",
  vacancies: "/vacancy-history",
};

const Dashboard: React.FC = () => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
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

  const metrics = useMemo(() => (summary ? buildMetrics(summary) : []), [summary]);
  const vacancyStatuses = useMemo(() => (summary ? buildStatusCards(summary) : []), [summary]);
  const monthlyData = useMemo(() => (summary ? buildMonthlyData(summary) : []), [summary]);

  // Y axis scales to the tallest bar so the chart never overflows or looks flat.
  const maxYValue = useMemo(() => {
    const values = monthlyData.flatMap((d) => [d.posiciones, d.cvs, d.vacantes]);
    const peak = values.length ? Math.max(...values) : 0;
    return peak > 0 ? peak : 1;
  }, [monthlyData]);

  const getY = (val: number) => 100 - (val / maxYValue) * 100;
  const getX = (index: number) =>
    monthlyData.length > 1 ? (index / (monthlyData.length - 1)) * 100 : 50;

  const ptsPosiciones = monthlyData.map((d, i) => `${getX(i)},${getY(d.posiciones)}`).join(" ");
  const ptsCVs = monthlyData.map((d, i) => `${getX(i)},${getY(d.cvs)}`).join(" ");
  const ptsVacantes = monthlyData.map((d, i) => `${getX(i)},${getY(d.vacantes)}`).join(" ");

  const totalVacancies = summary
    ? summary.vacancyStatusBreakdown.reduce((sum, s) => sum + s.count, 0)
    : 0;

  return (
    <div className="p-4 md:p-8 xl:p-10 animate-fade-in w-full h-full flex justify-center">
      <div className="w-full max-w-[1600px]">
        {/* HEADER */}
        <header className="mb-6 xl:mb-8 text-left flex flex-col">
          <h1 className="text-[22px] md:text-2xl xl:text-3xl font-medium text-gray-800 tracking-tight">
            Centro de Control
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
          <div className="rounded-2xl border border-gray-200 bg-white text-gray-500 text-sm font-medium p-6 text-center">
            Aún no hay datos disponibles para tu cuenta.
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

            {/* BOTTOM GRID: Graficos Estados */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 xl:gap-6">
              {/* GRAFICO INTERACTIVO */}
              <div className="lg:col-span-2 bg-white rounded-[24px] p-6 xl:p-8 shadow-sm border border-gray-100 flex flex-col min-h-[350px] xl:min-h-[450px] relative">
                <div className="flex items-center gap-3 mb-4 xl:mb-6">
                  <TrendingUp className="text-[#447ECA]" size={20} strokeWidth={2.5} />
                  <h2 className="text-[#1E293B] font-medium text-base xl:text-lg">Actividad Mensual</h2>
                </div>

                {/* Leyenda */}
                <div className="flex items-center gap-6 mb-6 xl:mb-8 text-xs xl:text-sm font-medium text-gray-400">
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#447ECA]"></div> Posiciones</div>
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#96FFC1]"></div> CVs</div>
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-gray-400"></div> Vacantes</div>
                </div>

                {/* ZONA DIBUJO DEL GRAFICO */}
                {monthlyData.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center text-xs text-gray-400 font-medium">
                    Sin actividad registrada todavía.
                  </div>
                ) : (
                  <>
                    <div className="relative flex-1 w-full mt-4 group">
                      <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                        <div className="border-t border-gray-100 w-full h-0 relative"><span className="absolute -left-5 -top-2 text-[10px] text-gray-300 font-medium">{maxYValue}</span></div>
                        <div className="border-t border-gray-100 w-full h-0 relative"><span className="absolute -left-5 -top-2 text-[10px] text-gray-300 font-medium">{Math.round(maxYValue / 2)}</span></div>
                        <div className="border-t border-gray-100 w-full h-0 relative"><span className="absolute -left-5 -top-2 text-[10px] text-gray-300 font-medium">0</span></div>
                      </div>

                      <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
                        <polyline points={ptsCVs} fill="none" stroke="#96FFC1" strokeWidth="1.5" />
                        <polyline points={ptsVacantes} fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeDasharray="2 2" />
                        <polyline points={ptsPosiciones} fill="none" stroke="#447ECA" strokeWidth="2" />

                        {hoveredIndex !== null && (
                          <circle
                            cx={getX(hoveredIndex)}
                            cy={getY(monthlyData[hoveredIndex].posiciones)}
                            r="3"
                            fill="white"
                            stroke="#447ECA"
                            strokeWidth="2"
                          />
                        )}
                      </svg>

                      {hoveredIndex !== null && (
                        <>
                          <div
                            className="absolute top-0 bottom-0 border-l border-dashed border-gray-300 pointer-events-none transition-all duration-200"
                            style={{ left: `${getX(hoveredIndex)}%` }}
                          />
                          <div
                            className="absolute z-20 bg-white p-3 xl:p-4 rounded-xl shadow-xl border border-gray-100 pointer-events-none transition-all duration-200 flex flex-col gap-1 w-[120px] xl:w-[140px]"
                            style={{
                              left: `${getX(hoveredIndex)}%`,
                              top: `${getY(monthlyData[hoveredIndex].cvs)}%`,
                              transform: 'translate(-50%, -120%)'
                            }}
                          >
                            <span className="text-xs xl:text-sm font-bold text-gray-600 border-b border-gray-100 pb-1 mb-1">
                              {monthlyData[hoveredIndex].month}
                            </span>
                            <span className="text-[11px] xl:text-xs text-[#447ECA] font-medium">posiciones: {monthlyData[hoveredIndex].posiciones}</span>
                            <span className="text-[11px] xl:text-xs text-[#4ADE80] font-medium">cvs: {monthlyData[hoveredIndex].cvs}</span>
                            <span className="text-[11px] xl:text-xs text-gray-500 font-medium">vacantes: {monthlyData[hoveredIndex].vacantes}</span>
                          </div>
                        </>
                      )}

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

                    <div className="flex justify-between text-[10px] xl:text-xs font-bold text-gray-300 uppercase mt-4 px-1">
                      {monthlyData.map((d, i) => <span key={`${d.month}-${i}`}>{d.month}</span>)}
                    </div>
                  </>
                )}
              </div>

              {/* STATUS BARS  */}
              <div className="lg:col-span-1 bg-white rounded-[24px] p-6 xl:p-8 shadow-sm border border-gray-100 flex flex-col">
                <div className="flex items-center gap-3 mb-6 xl:mb-8">
                  <BarChart3 className="text-[#447ECA]" size={20} strokeWidth={2.5} />
                  <h2 className="text-[#1E293B] font-medium text-base xl:text-lg">Estado de Vacantes</h2>
                </div>

                {vacancyStatuses.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center text-xs text-gray-400 font-medium">
                    Sin vacantes que reportar.
                  </div>
                ) : (
                  <>
                    <div className="w-full h-3.5 xl:h-4 flex rounded-full overflow-hidden mb-8 xl:mb-10 gap-[2px] bg-white">
                      {vacancyStatuses.map(status => (
                        <div key={`top-${status.id}`} className={`h-full ${status.bgClass}`} style={{ width: `${status.percentage}%` }}></div>
                      ))}
                    </div>

                    <div className="flex flex-col gap-5 xl:gap-6 flex-1">
                      {vacancyStatuses.map(status => (
                        <div key={`list-${status.id}`} className="flex flex-col gap-2">
                          <div className="flex justify-between items-center text-sm xl:text-base font-medium">
                            <div className="flex items-center gap-2">
                              <div className={`w-2.5 h-2.5 xl:w-3 xl:h-3 rounded-full ${status.bgClass}`}></div>
                              <span className="text-gray-600">{status.label}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-gray-400 text-xs xl:text-sm">{status.percentage}%</span>
                              <span className="bg-[#F0F7FF] text-[#447ECA] px-2 py-0.5 rounded text-xs xl:text-sm font-bold">{status.count}</span>
                            </div>
                          </div>
                          <div className="w-full h-1.5 xl:h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className={`h-full ${status.bgClass} rounded-full`} style={{ width: `${status.percentage}%` }}></div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 xl:mt-8 text-center text-gray-400 text-xs xl:text-sm font-medium border-t border-gray-50 pt-5 xl:pt-6">
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
