import iconPositionCreatedBlue from "../assets/icons/icon_position_created_blue.svg";
import iconVacantCreateBlue from "../assets/icons/icon_vacant_create_blue.svg";
import iconVacantActiveBlue from "../assets/icons/icon_vacant_active_blue.svg";
import iconCreateCircleplus from "../assets/icons/icon_create_circleplus.svg";
import iconUploadCv from "../assets/icons/icon_upload_cv.svg";
import iconVacantCreateButtom from "../assets/icons/icon_vacant_create_buttom.svg";

export const STATS_CONFIG = [
  {
    id: "posiciones", // Key used to map with backend data
    title: "Posiciones creadas",
    icon: iconPositionCreatedBlue,
    btn: "Crear Posiciones",
    btnIcon: iconCreateCircleplus,
  },
  {
    id: "cvs",
    title: "CVs subidos",
    icon: iconVacantCreateBlue,
    btn: "Subir CV",
    btnIcon: iconUploadCv,
  },
  {
    id: "vacantes",
    title: "Vacantes activas",
    icon: iconVacantActiveBlue,
    btn: "Crear Vacantes",
    btnIcon: iconVacantCreateButtom,
  },
];