import React, { useState } from "react";
import MetricCard from "../components/cards/MetricCard";
import { DashboardStats } from "../types/dashboard.types";

//Assets
import { Briefcase, BarChart2, Users, FileText, TrendingUp, BarChart3 } from "lucide-react";

//MOCK DATA HISTÓRICO MENSUAL
const MOCK_DATA: DashboardStats = {
  metrics: [
    { id: "1", count: 7, title: "Total Posiciones", subtext: "+2 este mes", icon: <Briefcase size={20} strokeWidth={2.5} /> },
    { id: "2", count: 6, title: "Departamentos Activos", subtext: "6 áreas", icon: <BarChart2 size={20} strokeWidth={2.5} /> },
    { id: "3", count: 14, title: "Candidatos en Pool", subtext: "14 CVs indexados", icon: <Users size={20} strokeWidth={2.5} /> },
    { id: "4", count: 4, title: "Vacantes Abiertas", subtext: "1 cerradas", icon: <FileText size={20} strokeWidth={2.5} /> },
  ],
  vacancyStatuses: [
    { id: "s1", label: "Abiertas", percentage: 50, count: 4, colorHex: "#447ECA", bgClass: "bg-[#447ECA]" },
    { id: "s2", label: "Cerradas", percentage: 13, count: 1, colorHex: "#EF5050", bgClass: "bg-[#EF5050]" },
    { id: "s3", label: "Contacto", percentage: 38, count: 3, colorHex: "#F8C807", bgClass: "bg-[#F8C807]" },
  ],
  monthlyData: [
    { month: "Ene", posiciones: 1, cvs: 5, vacantes: 1 },
    { month: "Feb", posiciones: 2, cvs: 9, vacantes: 2 },
    { month: "Mar", posiciones: 4, cvs: 14, vacantes: 5 },
    { month: "Abr", posiciones: 2, cvs: 7, vacantes: 3 },
    { month: "May", posiciones: 3, cvs: 11, vacantes: 4 },
  ]
};

const Dashboard: React.FC = () => {
  // Estado para el Tooltip interactivo
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // --- LÓGICA MATEMÁTICA DEL GRÁFICO ---
  const MAX_Y_VALUE = 14; 
  // Convierte un valor (0-14) en coordenadas SVG (0-100 invertido)
  const getY = (val: number) => 100 - (val / MAX_Y_VALUE) * 100;
  // Convierte el índice del mes (0-4) en porcentaje a lo ancho (0%, 25%, 50%, 75%, 100%)
  const getX = (index: number) => (index / (MOCK_DATA.monthlyData.length - 1)) * 100;

  // Generamos los puntos (points="x,y x,y...") para las líneas SVG
  const ptsPosiciones = MOCK_DATA.monthlyData.map((d, i) => `${getX(i)},${getY(d.posiciones)}`).join(" ");
  const ptsCVs = MOCK_DATA.monthlyData.map((d, i) => `${getX(i)},${getY(d.cvs)}`).join(" ");
  const ptsVacantes = MOCK_DATA.monthlyData.map((d, i) => `${getX(i)},${getY(d.vacantes)}`).join(" ");

  return (
    // FIX: Eliminamos fondos y alturas (bg-[#F8F9FB] min-h-screen) para heredar del Layout principal
    <div className="p-6 md:p-10 animate-fade-in w-full h-full">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER */}
        <header className="mb-8 text-left flex flex-col">
          <h1 className="text-[22px] md:text-2xl font-medium text-gray-800 tracking-tight">
            Centro de Control
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
          
          {/* GRÁFICO INTERACTIVO (Actividad Mensual) */}
          <div className="lg:col-span-2 bg-white rounded-[24px] p-8 shadow-sm border border-gray-100 flex flex-col min-h-[350px] relative">
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp className="text-[#447ECA]" size={20} strokeWidth={2.5} />
              <h2 className="text-[#1E293B] font-medium text-base">Actividad Mensual</h2>
            </div>
            
            {/* Leyenda */}
            <div className="flex items-center gap-6 mb-8 text-xs font-medium text-gray-400">
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#447ECA]"></div> Posiciones</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#96FFC1]"></div> CVs</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-gray-400"></div> Vacantes</div>
            </div>

            {/* ZONA DE DIBUJO DEL GRÁFICO */}
            <div className="relative flex-1 w-full mt-4 group">
               {/* Líneas Horizontales de Fondo */}
               <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                  <div className="border-t border-gray-100 w-full h-0 relative"><span className="absolute -left-5 -top-2 text-[10px] text-gray-300 font-medium">14</span></div>
                  <div className="border-t border-gray-100 w-full h-0 relative"><span className="absolute -left-5 -top-2 text-[10px] text-gray-300 font-medium">7</span></div>
                  <div className="border-t border-gray-100 w-full h-0 relative"><span className="absolute -left-5 -top-2 text-[10px] text-gray-300 font-medium">0</span></div>
               </div>

               {/* SVG Vectorial */}
               <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
                  <polyline points={ptsCVs} fill="none" stroke="#96FFC1" strokeWidth="1.5" />
                  <polyline points={ptsVacantes} fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeDasharray="2 2" />
                  <polyline points={ptsPosiciones} fill="none" stroke="#447ECA" strokeWidth="2" />
                  
                  {/* Punto Dinámico: Círculo en la línea azul cuando se hace hover */}
                  {hoveredIndex !== null && (
                    <circle 
                      cx={getX(hoveredIndex)} 
                      cy={getY(MOCK_DATA.monthlyData[hoveredIndex].posiciones)} 
                      r="2" 
                      fill="white" 
                      stroke="#447ECA" 
                      strokeWidth="1.5" 
                    />
                  )}
               </svg>

               {/* TOOLTIP INTERACTIVO & LÍNEA GUÍA */}
               {hoveredIndex !== null && (
                 <>
                    {/* Línea vertical punteada */}
                    <div 
                      className="absolute top-0 bottom-0 border-l border-dashed border-gray-300 pointer-events-none transition-all duration-200"
                      style={{ left: `${getX(hoveredIndex)}%` }}
                    />
                    {/* Caja del Tooltip */}
                    <div 
                      className="absolute z-20 bg-white p-3 rounded-xl shadow-xl border border-gray-100 pointer-events-none transition-all duration-200 flex flex-col gap-1 w-[120px]"
                      // Posicionamos el tooltip arriba del cursor, centrado en el eje X
                      style={{ 
                        left: `${getX(hoveredIndex)}%`, 
                        top: `${getY(MOCK_DATA.monthlyData[hoveredIndex].cvs)}%`,
                        transform: 'translate(-50%, -120%)'
                      }}
                    >
                      <span className="text-xs font-bold text-gray-600 border-b border-gray-100 pb-1 mb-1">
                        {MOCK_DATA.monthlyData[hoveredIndex].month}
                      </span>
                      <span className="text-[11px] text-[#447ECA] font-medium">posiciones: {MOCK_DATA.monthlyData[hoveredIndex].posiciones}</span>
                      <span className="text-[11px] text-[#4ADE80] font-medium">cvs: {MOCK_DATA.monthlyData[hoveredIndex].cvs}</span>
                      <span className="text-[11px] text-gray-500 font-medium">vacantes: {MOCK_DATA.monthlyData[hoveredIndex].vacantes}</span>
                    </div>
                 </>
               )}

               {/* ZONAS INVISIBLES DE HOVER (Columnas) */}
               <div className="absolute inset-0 flex">
                 {MOCK_DATA.monthlyData.map((_, i) => (
                   <div 
                     key={i} 
                     className="flex-1 h-full z-10 cursor-crosshair"
                     onMouseEnter={() => setHoveredIndex(i)}
                     onMouseLeave={() => setHoveredIndex(null)}
                   />
                 ))}
               </div>
            </div>
            
            {/* X-Axis */}
            <div className="flex justify-between text-[10px] font-bold text-gray-300 uppercase mt-4 px-1">
              {MOCK_DATA.monthlyData.map(d => <span key={d.month}>{d.month}</span>)}
            </div>
          </div>

          {/* STATUS BARS (Estado de Vacantes) */}
          <div className="lg:col-span-1 bg-white rounded-[24px] p-8 shadow-sm border border-gray-100 flex flex-col">
            <div className="flex items-center gap-3 mb-8">
              <BarChart3 className="text-[#447ECA]" size={20} strokeWidth={2.5} />
              <h2 className="text-[#1E293B] font-medium text-base">Estado de Vacantes</h2>
            </div>

            {/* Barra Combinada Top (FIX: Separación reducida a gap-[2px]) */}
            <div className="w-full h-3.5 flex rounded-full overflow-hidden mb-10 gap-[2px] bg-white">
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
                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full ${status.bgClass} rounded-full`} style={{ width: `${status.percentage}%` }}></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer Total */}
            <div className="mt-8 text-center text-gray-400 text-xs font-medium border-t border-gray-50 pt-6">
              {MOCK_DATA.metrics.find(m => m.id === "4")?.count} vacantes en total
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;