import React from "react";
import MetricCard from "../components/cards/MetricCard";
import { DashboardStats } from "../types/dashboard.types";
import { Icons } from "../assets/icons";

// --- MOCK DATA (Simulación estricta según el requerimiento del Lead) ---
const MOCK_DATA: DashboardStats = {
  totalVacancies: 8,
  metrics: [
    { id: "1", count: 7, title: "Total Posiciones", subtext: "+2 este mes", icon: Icons.sidebar.vacant },
    { id: "2", count: 6, title: "Departamentos Activos", subtext: "6 áreas", icon: Icons.sidebar.history },
    { id: "3", count: 14, title: "Candidatos en Pool", subtext: "14 CVs indexados", icon: Icons.stats.vacantCreateBlue },
    { id: "4", count: 4, title: "Vacantes Abiertas", subtext: "1 cerradas", icon: Icons.stats.uploadCv },
  ],
  vacancyStatuses: [
    { id: "s1", label: "Abiertas", percentage: 50, count: 4, colorHex: "#447ECA", bgClass: "bg-[#447ECA]" },
    { id: "s2", label: "Cerradas", percentage: 13, count: 1, colorHex: "#EF5050", bgClass: "bg-[#EF5050]" },
    { id: "s3", label: "Contacto", percentage: 38, count: 3, colorHex: "#F8C807", bgClass: "bg-[#F8C807]" },
  ]
};

const Dashboard: React.FC = () => {
  return (
    <div className="p-6 md:p-10 animate-fade-in bg-[#F8F9FB] min-h-screen">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER */}
        <header className="mb-8 text-left flex flex-col">
          <h1 className="text-[22px] md:text-2xl font-medium text-gray-800 tracking-tight">
            Centro de Observabilidad
          </h1>
          <p className="text-gray-400 text-sm font-medium mt-1">
            Resumen en tiempo real de tu pipeline de talento
          </p>
        </header>

        {/* TOP GRID: Métricas */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {MOCK_DATA.metrics.map((metric) => (
            <MetricCard
              key={metric.id}
              count={metric.count}
              title={metric.title}
              subtext={metric.subtext}
              icon={metric.icon}
            />
          ))}
        </section>

        {/* BOTTOM GRID: Gráficos y Estados */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* CHART PLACEHOLDER (Actividad Mensual) */}
          <div className="lg:col-span-2 bg-white rounded-[24px] p-8 shadow-sm border border-gray-100 flex flex-col min-h-[350px]">
            <div className="flex items-center gap-3 mb-6">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#447ECA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
              <h2 className="text-[#1E293B] font-medium text-base">Actividad Mensual</h2>
            </div>
            
            {/* Leyenda */}
            <div className="flex items-center gap-6 mb-8 text-xs font-medium text-gray-400">
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#447ECA]"></div> Posiciones</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#96FFC1]"></div> CVs</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-gray-400"></div> Vacantes</div>
            </div>

            {/* Falso Gráfico Vectorial (Mock) fiel a tu imagen */}
            <div className="relative flex-1 w-full mt-4">
               {/* Líneas de fondo */}
               <div className="absolute inset-0 flex flex-col justify-between">
                  <div className="border-t border-gray-100 w-full h-0"></div>
                  <div className="border-t border-gray-100 w-full h-0"></div>
                  <div className="border-t border-gray-100 w-full h-0"></div>
               </div>
               {/* SVG Mock Lines */}
               <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                  {/* CVs (Verde) */}
                  <polyline points="0,70 33,30 66,80 100,50" fill="none" stroke="#96FFC1" strokeWidth="1.5" />
                  {/* Vacantes (Gris Dashed) */}
                  <polyline points="0,95 33,85 66,90 100,88" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeDasharray="2 2" />
                  {/* Posiciones (Azul) */}
                  <polyline points="0,98 33,88 66,95 100,92" fill="none" stroke="#447ECA" strokeWidth="1.5" />
               </svg>
            </div>
            
            {/* X-Axis */}
            <div className="flex justify-between text-[10px] font-bold text-gray-300 uppercase mt-4">
              <span>Ene</span><span>Feb</span><span>Mar</span><span>Abr</span><span>May</span>
            </div>
          </div>

          {/* STATUS BARS (Estado de Vacantes) */}
          <div className="lg:col-span-1 bg-white rounded-[24px] p-8 shadow-sm border border-gray-100 flex flex-col">
            <div className="flex items-center gap-3 mb-8">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#447ECA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 20V10"></path><path d="M12 20V4"></path><path d="M6 20v-6"></path></svg>
              <h2 className="text-[#1E293B] font-medium text-base">Estado de Vacantes</h2>
            </div>

            {/* Barra Combinada Top */}
            <div className="w-full h-3.5 flex rounded-full overflow-hidden mb-10 gap-1 bg-gray-100">
               {MOCK_DATA.vacancyStatuses.map(status => (
                 <div key={`top-${status.id}`} className={`h-full ${status.bgClass}`} style={{ width: `${status.percentage}%` }}></div>
               ))}
            </div>

            {/* Lista Desglosada */}
            <div className="flex flex-col gap-6 flex-1">
              {MOCK_DATA.vacancyStatuses.map(status => (
                <div key={`list-${status.id}`} className="flex flex-col gap-2">
                  <div className="flex justify-between items-center text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${status.bgClass}`}></div>
                      <span className="text-gray-600">{status.label}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-gray-400 text-xs">{status.percentage}%</span>
                      <span className="bg-[#F0F7FF] text-[#447ECA] px-2 py-0.5 rounded text-xs font-bold">{status.count}</span>
                    </div>
                  </div>
                  {/* Mini barra de progreso */}
                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full ${status.bgClass} rounded-full`} style={{ width: `${status.percentage}%` }}></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer Total */}
            <div className="mt-8 text-center text-gray-400 text-xs font-medium border-t border-gray-50 pt-6">
              {MOCK_DATA.totalVacancies} vacantes en total
            </div>
          </div>

        </section>
      </div>
    </div>
  );
};

export default Dashboard;