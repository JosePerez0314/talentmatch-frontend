TalentMatch AI - Frontend Experience & Recruitment Dashboard

Resumen Ejecutivo
Esta es la interfaz de usuario oficial de TalentMatch AI, una plataforma SaaS diseñada para transformar la experiencia de reclutamiento técnico. Mientras el motor de IA procesa los datos en las sombras, este Frontend proporciona a los reclutadores un panel de control intuitivo, rápido y potente para visualizar el talento.

Nuestra interfaz no es solo un formulario de carga; es una herramienta de toma de decisiones que presenta un "Top 10" de candidatos mediante visualizaciones claras, permitiendo que el reclutador pase del "papel" a la "contratación" en segundos.

Características Principales
Smart Dashboard: Visualización en tiempo real de métricas críticas (Vacantes activas, CVs procesados, candidatos destacados).

Pipeline de Carga Interactiva: Interfaz de drag-and-drop para resumes con feedback inmediato sobre el estado del procesamiento.

Leaderboard de Candidatos: Visualización matemática del "Match Score", desglosando por qué un candidato es apto (Hard Skills, Experiencia, Educación).

Gestión de Vacantes: CRUD completo de posiciones con un sistema de etiquetado para definir los pesos del algoritmo de IA.

Diseño Responsivo: Optimizado para flujos de trabajo en escritorio y consultas rápidas desde dispositivos móviles.

Tech Stack
Hemos seleccionado herramientas que priorizan el rendimiento y la mantenibilidad:

Core: React.js (v18+)

Build Tool: Vite (para un desarrollo ultrarrápido)

Estado Global: React Context API o Redux Toolkit (según escala)

Estilos: CSS3 Moderno con Metodología BEM y Variables de CSS (Custom Properties) para consistencia de diseño.

Networking: Axios (con interceptores para manejo de JWT).

Validación: Zod / React Hook Form.

Estructura de Carpetas (Clean Architecture)

src/
├── assets/             # Imágenes, SVGs y fuentes.
├── components/         # Componentes reutilizables (Botones, Inputs, Cards).
├── hooks/              # Custom hooks para lógica desacoplada (useAuth, useCandidates).
├── layouts/            # Wrappers de estructura (AuthLayout, DashboardLayout).
├── pages/              # Componentes de página de nivel superior.
├── services/           # Abstracción de llamadas a la API (Axios instances).
├── styles/             # Variables globales y reset (main.css, variables.css).
└── utils/              # Funciones puras de ayuda (formateadores de fecha, scores).

Ejemplo de Implementación: Componente de Match Score
Siguiendo tus directrices de Código Limpio y ES6+, así es como estructuramos un componente clave:

import React from 'react';
import './MatchScore.css'; // Implementando BEM

/**
 * Componente que muestra el puntaje matemático de un candidato.
 * @param {number} score - Valor de 0 a 100.
 */
const MatchScore = ({ score = 0 }) => {
  // Desestructuración y lógica limpia
  const getStatusClass = (val) => {
    if (val >= 80) return 'match-score--high';
    if (val >= 50) return 'match-score--medium';
    return 'match-score--low';
  };

  return (
    <div className={`match-score ${getStatusClass(score)}`}>
      <svg className="match-score__ring" width="60" height="60">
        <circle
          className="match-score__circle"
          strokeDasharray={`${score} 100`}
          cx="30"
          cy="30"
          r="25"
        />
      </svg>
      <span className="match-score__value">{score}%</span>
    </div>
  );
};

export default MatchScore;

Configuración e Instalación
Requisitos previos: Node.js (v18+) y el Backend de TalentMatch AI en ejecución.

Clonar el repositorio:
git clone https://github.com/tu-usuario/talentmatch-frontend.git

Instalar dependencias:
npm install
    ```
3.  **Variables de Entorno:**
    Crea un archivo `.env` en la raíz con:
    ```env
    VITE_API_URL=http://localhost:3000/api
    ```
4.  **Ejecutar en desarrollo:**
    ```bash
    npm run dev
    ```

---

### Puntos Clave de la Solución

1.  **Consistencia con el Backend:** He mantenido la terminología (Match Score, Guillotine Rule, Vacancy) para que el desarrollador que salte de un repo a otro no se sienta perdido.
2.  **Arquitectura Modular:** El uso de una carpeta `services/` separa la lógica de red de los componentes de UI, cumpliendo con el principio de **Responsabilidad Única (SOLID)**.
3.  **Escalabilidad visual:** Al usar Variables de CSS, cambiar el tema de la aplicación (por ejemplo, a un modo oscuro) es cuestión de modificar un solo archivo de configuración.

> [!TIP]
> **Sugerencia Pro:** Para el manejo de las listas de candidatos, implementa **Virtual Scrolling** (con librerías como `react-window`). Si TalentMatch AI llega a procesar 5,000 CVs por vacante, el DOM se saturará. El scroll virtualizado solo renderiza lo que el usuario ve, manteniendo la interfaz a 60fps constantes.

---

¿Hay alguna sección específica del frontend (como el panel de carga de PDFs o el gráfico de habilidades) que te gustaría detallar más en el README?
