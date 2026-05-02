import React from "react";
import { useNavigate } from "react-router-dom";
//Aseets
import { Icons } from "../../assets/icons";

const StatCard = ({ title, icon, count, btnText, btnIcon, actionPath, viewPath }) => {
  const navigate = useNavigate();
  return (
    // CAMBIO: flex-col para móvil, md:flex-row para escritorio. items-start en móvil.
    <div className="bg-white p-6 rounded-[12px] shadow-sm border border-[#DCF9FF] flex flex-col md:flex-row md:justify-between md:items-center gap-6 transition-all hover:shadow-md">

      <div className="flex items-center gap-6 group">
        <div className="w-16 h-16 bg-[#DCF9FF] rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105 shrink-0">
          <img src={icon} alt={title} className="w-8 h-8 object-contain" />
        </div>

        <div>
          <p className="text-sm text-black font-medium">{title}</p>
          <p className="text-3xl font-extrabold text-black tracking-tight">
            {count}
          </p>
        </div>
      </div>

      {/* CAMBIO: Botones en grid de 2 columnas para móvil, o uno debajo del otro */}
      <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
        <button
          onClick={() => navigate(viewPath)}
          className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-100 rounded-xl text-sm font-bold text-gray-400 hover:bg-gray-200 transition-all w-full md:w-auto"
        >
          <img src={Icons.stats.eyeHistoryGray} alt="Ver historial" className="w-4 h-4 opacity-70" />
          <span>Ver</span>
        </button>

        <button
          onClick={() => navigate(actionPath)}
          className="flex items-center justify-center gap-2 bg-[#447ECA] text-white px-8 py-3 rounded-xl text-[13px] font-bold hover:bg-[#3669ab] transition-all shadow-md active:scale-95 w-full md:w-auto"
        >
          <img src={btnIcon} alt={btnText} className="w-4 h-4 brightness-0 invert" />
          <span>{btnText}</span>
        </button>
      </div>
    </div>
  );
};

export default StatCard;