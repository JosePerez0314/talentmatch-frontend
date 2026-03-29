// Comentarios en ingles

import React from "react";
import Sidebar from "../components/Sidebar";
//Iconos

// Lo mismo a corregir que en el login.jsx
import logoSmall from "../assets/icons/Logo_TalentMatch_AI_Small.png";
import iconPositionCreatedBlue from "../assets/icons/icon_position_created_blue.png";
import iconVacantCreateBlue from "../assets/icons/icon_vacant_create_blue.png";
import iconVacantActiveBlue from "../assets/icons/icon_vacant_active_blue.png";
//Iconos de botones
import iconEyeHistoryGray from "../assets/icons/icon_eye_history.png";
import iconCreateCircleplus from "../assets/icons/icon_create_circleplus.png";
import iconUploadCv from "../assets/icons/icon_upload_cv.png";
import iconVacantCreateButtom from "../assets/icons/icon_vacant_create_buttom.png";

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
  // ESTA ES LA ZONA DONDE SE CONECTARÁ EL BACKEND
  const stats = [
    {
      title: "Posiciones creadas",
      icon: iconPositionCreatedBlue,
      count: 0,
      btn: "Crear Posiciones",
      btnIcon: iconCreateCircleplus,
    },
    {
      title: "CVs subidos",
      icon: iconVacantCreateBlue,
      count: 0,
      btn: "Subir CV",
      btnIcon: iconUploadCv,
    },
    {
      title: "Vacantes activas",
      icon: iconVacantActiveBlue,
      count: 0,
      btn: "Crear Vacantes",
      btnIcon: iconVacantCreateButtom,
    },
  ];

  const lastMovements = {
    posicion: "Sin posiciones",
    cv: "N/A",
    cerradas: 0,
  };

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

      {/* LOGO AL LADO DEL SIDEBAR */}
      <div className="fixed top-8 left-24 z-[60] hidden md:block">
        <img
          src={logoSmall}
          alt="TalentMatch AI"
          className="h-10 w-auto object-contain opacity-90"
        />
      </div>

      <main className="flex-1 p-10 overflow-y-auto">
        {/* Encabezado */}
        <header className="flex justify-center mb-10">
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">
            Dashboard - Centro de Control
          </h1>
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-400"></div>
        </header>

        {/* Grid Superior: Estadísticas en 0 */}
        <div className="grid grid-cols-1 gap-6 mb-8">
          {stats.map((item, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-[12px] shadow-sm border border-[#DCF9FF] flex justify-between items-center transition-all hover:shadow-md"
            >
              <div className="flex items-center gap-6">
                {/* Espacio para el icono que pondrá después */}
                <div className="w-16 h-16 bg-[#DCF9FF] rounded-2xl flex items-center justify-center">
                  <div className="w-16 h-16 bg-[#DCF9FF] rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105">
                    <img
                      src={item.icon}
                      alt={item.title}
                      className="w-8 h-8 object-contain"
                    />
                  </div>
                </div>
                <div>
                  <p className="text-sm text-black font-medium">{item.title}</p>
                  <p className="text-3xl font-extrabold text-black tracking-tight">
                    {item.count}
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <button className="flex items-center gap-2 px-6 py-2.5 border border-gray-100 rounded-xl text-sm font-bold text-gray-400 hover:bg-gray-50 transition-all">
                  <img
                    src={iconEyeHistoryGray}
                    alt=""
                    className="w-4 h-4 opacity-70"
                  />
                  <span>Ver</span>
                </button>
                <button className="flex items-center gap-2 bg-[#447ECA] text-white px-8 py-2.5 rounded-xl text-[13px] font-bold hover:bg-[#3669ab] transition-all shadow-md active:scale-95">
                  <img
                    src={item.btnIcon}
                    alt=""
                    className="w-4 h-4 brightness-0 invert"
                  />
                  <span>{item.btn}</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Grid Inferior: Últimos movimientos con Grid Repeat */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-7 rounded-[20px] shadow-sm border border-white text-center">
            <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest italic">
              Última posición creada
            </p>
            <p className="text-[#447ECA] font-bold mt-2 text-sm">
              {lastMovements.posicion}
            </p>
          </div>
          <div className="bg-white p-7 rounded-[20px] shadow-sm border border-white text-center">
            <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest italic">
              Último CV subido
            </p>
            <p className="text-[#447ECA] font-bold mt-2 text-sm">
              {lastMovements.cv}
            </p>
          </div>
          <div className="bg-white p-7 rounded-[20px] shadow-sm border border-white text-center">
            <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest italic">
              Vacantes cerradas
            </p>
            <p className="text-[#447ECA] font-bold mt-2 text-sm">
              {lastMovements.cerradas}
            </p>
          </div>
        </div>

        {/* Sección de CTA/ llamado a la accion*/}
        <div className="bg-[#DCF9FF] p-12 rounded-[20px] text-center border border-[#447ECA]/5">
          <p className="text-[#447ECA] font-semibold text-lg mb-8 italic">
            "¿Listo para encontrar tu próximo talento? Crea una vacante y deja
            que la IA haga el trabajo."
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
