# TalentMatch AI - Frontend Experience & Recruitment Dashboard

## 🚀 Resumen
Esta es la interfaz de usuario oficial de **TalentMatch AI**, una plataforma SaaS diseñada para transformar la experiencia de reclutamiento técnico. Mientras el motor de IA procesa los datos en las sombras, este Frontend proporciona a los reclutadores un panel de control intuitivo, rápido y potente para visualizar el talento.

Nuestra interfaz no es solo un formulario de carga; es una herramienta de toma de decisiones que presenta un "Top 10" de candidatos mediante visualizaciones claras, permitiendo que el reclutador pase del "papel" a la "contratación" en segundos.

---

## ✨ Características Principales
* **Smart Dashboard:** Visualización en tiempo real de métricas críticas (Vacantes activas, CVs procesados, candidatos destacados).
* **Pipeline de Carga Interactiva:** Interfaz de *drag-and-drop* para currículums con feedback inmediato sobre el estado del procesamiento.
* **Leaderboard de Candidatos:** Visualización matemática del "Match Score", desglosando por qué un candidato es apto (Hard Skills, Experiencia, Educación).
* **Gestión de Vacantes:** CRUD completo de posiciones con un sistema de etiquetado para definir los pesos del algoritmo de IA.
* **Diseño Responsivo:** Optimizado para flujos de trabajo en escritorio y consultas rápidas desde dispositivos móviles.

---

## 🛠️ Tech Stack
Hemos seleccionado herramientas que priorizan el rendimiento y la mantenibilidad:

* **Core:** React.js (v18+)
* **Build Tool:** Vite (para un desarrollo ultrarrápido)
* **Estado Global:** React Context API o Redux Toolkit (según escala)
* **Estilos:** CSS3 Moderno con Metodología BEM y Variables de CSS (Custom Properties) para consistencia de diseño.
* **Networking:** Axios (con interceptores para manejo de JWT).
* **Validación:** Zod / React Hook Form.

---

## 📁 Estructura de Carpetas (Clean Architecture)
<pre>
src/
├── assets/     # Imágenes, SVGs y fuentes.
├── components/ # Componentes reutilizables (Botones, Inputs, Cards).
├── hooks/      # Custom hooks para lógica desacoplada (useAuth, useCandidates).
├── layouts/    # Wrappers de estructura (AuthLayout, DashboardLayout).
├── pages/      # Componentes de página de nivel superior.
├── services/   # Abstracción de llamadas a la API (Axios instances).
├── styles/     # Variables globales y reset (main.css, variables.css).
└── utils/      # Funciones puras de ayuda (formateadores de fecha, scores).
</pre>

## 💻Ejemplo de Implementación: Componente de Match Score
Siguiendo las directrices de Código Limpio y ES6+, así es como estructuramos un componente clave:

```
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
      <svg className="match-score__svg" viewBox="0 0 60 60">
        <circle 
          className="match-score__circle" 
          strokeDasharray={`${score} 100`} 
          cx="30" 
          cy="30" 
          r="25" 
        />
      </svg>
      <span className="match-score__text">{score}%</span>
    </div>
  );
};

export default MatchScore;
```

## ⚙️Configuración e Instalación
Requisitos previos: Node.js (v18+) y el Backend de TalentMatch AI en ejecución.

### Clonar el repositorio:
```
git clone https://github.com/tu-usuario/talentmatch-frontend.git
```


### Instalar dependencias:
```
npm install
```

### Variables de Entorno:
Crea un archivo .env en la raíz del proyecto e incluye la ruta de la API:

```
VITE_API_URL=http://localhost:3000/api
```

### Ejecutar en desarrollo:
```
npm run dev
```
