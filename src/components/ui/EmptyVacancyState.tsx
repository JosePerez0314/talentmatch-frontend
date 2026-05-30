import React from "react";
import { FiAlertTriangle } from "react-icons/fi";

interface EmptyVacancyStateProps {
  onCreateClick: () => void;
}

const EmptyVacancyState: React.FC<EmptyVacancyStateProps> = ({ onCreateClick }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] animate-fade-in text-center">
      <div className="mb-6 text-[#447ECA] bg-blue-50 p-4 rounded-full">
        <FiAlertTriangle className="w-12 h-12" />
      </div>

      <h2 className="text-2xl font-bold text-gray-800 mb-8 tracking-tight">
        ¡Aún no tienes vacantes creadas!
      </h2>

      <button
        onClick={onCreateClick}
        className="bg-[#447ECA] text-white px-8 py-3.5 rounded-xl font-medium text-base hover:bg-[#3669ab] transition-colors active:scale-95 shadow-md"
      >
        Crear vacante
      </button>
    </div>
  );
};

export default EmptyVacancyState;