import React from "react";
import { Icons } from "../../assets/icons/index";

const EmptyVacancyState = ({ onCreateClick }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] animate-fade-in text-center">
      {/* Icon Warning */}
      <div className="mb-6">
        <img
          src={Icons.vacancies.warningAlert}
          alt="Advertencia"
          className="w-16 h-16 object-contain opacity-80"
        />
      </div>

      <h2 className="text-2xl font-bold text-gray-800 mb-8 tracking-tight">
        ¡Aun no tienes vacantes creadas!
      </h2>

      <button
        onClick={onCreateClick}
        className="bg-[#447ECA] text-white px-8 py-3 rounded-md font-medium text-lg hover:bg-gray-500 transition-colors active:scale-95 shadow-sm"
      >
        Crear vacante
      </button>
    </div>
  );
};

export default EmptyVacancyState;