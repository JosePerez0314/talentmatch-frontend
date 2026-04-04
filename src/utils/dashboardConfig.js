//Assets
import { Icons } from "../assets/icons";

export const STATS_CONFIG = [
  {
    id: "posiciones", // Clave para mapear con los datos del backend
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