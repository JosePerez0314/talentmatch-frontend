import React from "react";

const EmptyHistory = () => (
    <div className="flex-grow flex flex-col items-center justify-center py-24 px-10">
        <div className="w-20 h-20 bg-[#F9FAFB] rounded-full flex items-center justify-center mb-6 border border-gray-100">
            <span className="text-4xl font-black text-gray-200 italic">!</span>
        </div>
        <h2 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">
            ¡Aún no hay CVs subidos!
        </h2>
        <p className="text-gray-400 font-medium text-center max-w-[280px] leading-relaxed">
            Tu historial aparecerá aquí cuando comiences a procesar candidatos.
        </p>
    </div>
);

export default EmptyHistory;