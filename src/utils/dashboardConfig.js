//Assets
import { Icons } from "../assets/icons";

// Default values for metrics when the page loads
export const INITIAL_METRICS = {
  posiciones: 0,
  cvs: 0,
  vacantes: 0,
};

// Default values for last movements
export const INITIAL_MOVEMENTS = {
  posicion: "Cargando...",
  cv: "Cargando...",
  cerradas: 0,
};

export const STATS_CONFIG = [
  {
    id: "posiciones",
    title: "Posiciones creadas",
    icon: Icons.stats.posCreatedBlue,
    btn: "Crear Posiciones",
    btnIcon: Icons.stats.createPlus,
  },
  {
    id: "cvs",
    title: "CVs subidos",
    icon: Icons.stats.vacantCreateBlue,
    btn: "Subir CV",
    btnIcon: Icons.stats.uploadCv,
  },
  {
    id: "vacantes",
    title: "Vacantes activas",
    icon: Icons.stats.vacantActiveBlue,
    btn: "Crear Vacantes",
    btnIcon: Icons.stats.vacantCreateBtn,
  },
];