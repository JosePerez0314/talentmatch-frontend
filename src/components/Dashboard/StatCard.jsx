import React from "react";
import iconEyeHistoryGray from "../../assets/icons/icon_eye_history.svg";

const StatCard = ({ title, icon, count, btnText, btnIcon }) => {
  return (
    <div className="bg-white p-6 rounded-[12px] shadow-sm border border-[#DCF9FF] flex justify-between items-center transition-all hover:shadow-md">
      <div className="flex items-center gap-6 group">
        
        {/* Solución al "Div Inception": Un solo contenedor */}
        <div className="w-16 h-16 bg-[#DCF9FF] rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105">
          <img src={icon} alt={title} className="w-8 h-8 object-contain" />
        </div>

        <div>
          <p className="text-sm text-black font-medium">{title}</p>
          <p className="text-3xl font-extrabold text-black tracking-tight">
            {count}
          </p>
        </div>
      </div>

      <div className="flex gap-4">
        <button className="flex items-center gap-2 px-6 py-2.5 border border-gray-100 rounded-xl text-sm font-bold text-gray-400 hover:bg-gray-50 transition-all">
          <img src={iconEyeHistoryGray} alt="Ver historial" className="w-4 h-4 opacity-70" />
          <span>Ver</span>
        </button>

        <button className="flex items-center gap-2 bg-[#447ECA] text-white px-8 py-2.5 rounded-xl text-[13px] font-bold hover:bg-[#3669ab] transition-all shadow-md active:scale-95">
          <img src={btnIcon} alt={btnText} className="w-4 h-4 brightness-0 invert" />
          <span>{btnText}</span>
        </button>
      </div>
    </div>
  );
};

export default StatCard;