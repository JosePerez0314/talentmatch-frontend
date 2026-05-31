import React from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, Sparkles, ArrowLeft } from "lucide-react";

interface PositionSuccessProps {
  positionName: string;
  isAiGenerated?: boolean;
  onReset: () => void;
}

const PositionSuccess: React.FC<PositionSuccessProps> = ({ positionName, isAiGenerated = false, onReset }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center animate-fade-in p-4">
      {/* Tarjeta de Éxito Oscura */}
      <div className="bg-[#2D2D2D] w-full max-w-2xl rounded-[32px] p-12 md:p-16 flex flex-col items-center justify-center text-center shadow-2xl mb-8 relative">
        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg mb-6">
          <CheckCircle2 size={32} className="text-[#447ECA]" strokeWidth={2.5} />
        </div>

        <h2 className="text-white text-2xl md:text-3xl font-medium tracking-tight mb-4">
          Posición creada con éxito
        </h2>
        
        <p className="text-gray-400 text-base md:text-lg mb-6">
          "<span className="text-white font-medium">{positionName}</span>" ha sido agregada al sistema.
        </p>

        {/* Badge IA Condicional */}
        {isAiGenerated && (
          <div className="flex items-center gap-2 text-[#447ECA] bg-[#447ECA]/10 px-4 py-2 rounded-full border border-[#447ECA]/20">
            <Sparkles size={16} />
            <span className="text-sm font-medium">Generado con asistencia de IA</span>
          </div>
        )}
      </div>

      {/* Botones de acción */}
      <div className="flex w-full max-w-2xl justify-between items-center px-2">
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 bg-white text-gray-700 px-6 py-3.5 rounded-xl font-medium border border-gray-200 shadow-sm hover:bg-gray-50 transition-all active:scale-95 text-sm"
        >
          <ArrowLeft size={18} />
          Dashboard
        </button>

        <button
          onClick={onReset}
          className="bg-[#447ECA] text-white px-8 py-3.5 rounded-xl font-bold shadow-lg shadow-blue-900/20 hover:bg-[#3669ab] transition-all active:scale-95 text-sm"
        >
          Crear otra posición
        </button>
      </div>
    </div>
  );
};

export default PositionSuccess;