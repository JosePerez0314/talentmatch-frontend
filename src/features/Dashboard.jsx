// Comentarios en ingles

import React from "react";
import { useEffect, useState } from "react";
//Components
import Sidebar from "../components/Sidebar";
import StatCard from "../components/Dashboard/StatCard";
import MovementCard from "../components/Dashboard/MovementCard";

//Config dashboard
import { STATS_CONFIG } from "../utils/dashboardConfig";

{
  /** 1. El Acertijo del Componente Faltante (Tu observación)
La directriz: Tienen que crear un componente reutilizable, por ejemplo src/components/Dashboard/StatCard.jsx.

El estándar Senior: El Dashboard solo debe hacer un .map() sobre ese arreglo y renderizar los componentes limpios. Ejemplo:

JavaScript
{stats.map((stat, index) => (
  <StatCard key={index} data={stat} />
))}
2. La Trampa del Re-renderizado (El error invisible)
El Error: Declararon la constante stats y lastMovements dentro de la función const Dashboard = () => { ... }.

Por qué es grave: En React, cada vez que el estado del Dashboard cambie (por ejemplo, cuando cargue la data del backend), el componente se vuelve a renderizar. Al tener ese arreglo adentro, React va a destruir y volver a crear ese arreglo en memoria en cada renderizado, destruyendo el rendimiento de la aplicación.

La Solución: Todo dato estático (iconos, textos de botones, títulos) debe declararse fuera del componente, arriba del todo, o en un archivo de configuración separado (ej. src/utils/dashboardConfig.js).

3. Mezclando Interfaz con Datos (Problema de Integración)
El Error: Están mezclando la configuración visual (iconos, textos de botones) con el estado de los datos (count: 0).

Por qué afectará tu API: Como tú mismo construiste el backend, sabes perfectamente que tu API RESTful no les va a devolver iconos de flechas ni textos de botones. Tu API solo les va a devolver números: { posicionesCreadas: 12, cvsSubidos: 45, vacantesActivas: 3 }.

La Solución: Oblígalos a separar el diseño del dato dinámico. El arreglo de configuración estática solo debe tener los iconos y títulos. Los números (counts) deben venir exclusivamente de un estado controlado por la respuesta de tu backend (const [metrics, setMetrics] = useState(...)).*/
}

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

  // Simulamos la carga desde el backend
  useEffect(() => {
    // Aquí iría tu: const data = await apiService.getDashboardData();
    // Por ahora, simulamos que los datos llegan después de 1 segundo
    const fetchDashboardData = async () => {
      setTimeout(() => {
        setMetrics({ posiciones: 12, cvs: 45, vacantes: 3 });
        setLastMovements({ posicion: "Desarrollador React", cv: "juan_perez.pdf", cerradas: 2 });
      }, 1000);
    };

    fetchDashboardData();
  }, []);

  {
    /** 1. "Div Inception" (Redundancia HTML Absurda)
El Error: Mira el espacio del ícono dentro del .map(). Tienen un div envolviendo a otro div con exactamente las mismas clases:

JavaScript
<div className="w-16 h-16 bg-[#DCF9FF] rounded-2xl flex items-center justify-center">
  <div className="w-16 h-16 bg-[#DCF9FF] rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105">
La Solución: Esto es un error de copy-paste de Tailwind. Diles que eliminen el div exterior. Solo necesitan un contenedor para la imagen.

2. DRY en el "Grid Inferior" (Tarjetas Repetidas)
El Error: Escribieron la misma estructura de tarjeta blanca con el texto gris itálico tres veces seguidas para Última posición, Último CV y Vacantes cerradas.

La Solución: Oblígalos a crear un micro-componente (ej. <MovementCard title="Última posición creada" value={lastMovements.posicion} />) y que lo usen tres veces. Si el día de mañana quieres que esas tarjetas tengan sombra, ahora mismo tendrían que editar el código en tres lugares distintos.

3. Números Mágicos y Responsividad Rota
El Error: El logo pequeño tiene la clase fixed top-8 left-24 z-[60].

Por qué es un peligro: left-24 es un "número mágico". Si en una pantalla de tablet el Sidebar se colapsa o cambia de tamaño, ese logo va a quedar flotando en medio de la nada o tapando texto.

La Solución: El logo superior debería ser parte del componente <Header /> o de la estructura del <Sidebar />, no estar flotando con coordenadas absolutas/fijas.

4. Basura en el DOM (Etiquetas Vacías)
El Error: Tienen un div vacío en el encabezado: <div className="flex items-center gap-2 text-sm font-semibold text-gray-400"></div>

La Solución: Si no hay nada adentro (como un botón de perfil o la fecha actual), que lo borren. El código de producción no debe tener etiquetas muertas. */
  }

  return (
    <div className="flex min-h-screen bg-[#F0F0F5]">
      <Sidebar />
      {/* El logo flotante (top-8 left-24) fue eliminado según indicaciones del Lead. 
          Se recomienda integrarlo dentro del componente <Sidebar /> */}

      <main className="flex-1 p-10 overflow-y-auto">
        
        {/* Encabezado Limpio (Sin div vacío) */}
        <header className="flex justify-center mb-10">
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">
            Dashboard - Centro de Control
          </h1>
        </header>

        {/* Grid Superior: Mapeo de Componente Limpio */}
        <div className="grid grid-cols-1 gap-6 mb-8">
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <MovementCard title="Última posición creada" value={lastMovements.posicion} />
          <MovementCard title="Último CV subido" value={lastMovements.cv} />
          <MovementCard title="Vacantes cerradas" value={lastMovements.cerradas} />
        </div>

        {/* Sección de CTA */}
        <div className="bg-[#DCF9FF] p-12 rounded-[20px] text-center border border-[#447ECA]/5">
          <p className="text-[#447ECA] font-semibold text-lg mb-8 italic">
            "¿Listo para encontrar tu próximo talento? Crea una vacante y deja que la IA haga el trabajo."
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
