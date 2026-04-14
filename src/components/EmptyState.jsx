import React from "react";

const EmptyState = ({
    title = "¡Aún no hay CVs subidos!",
    description = "Tu historial aparecerá aquí cuando comiences a procesar candidatos."
}) => (
    <div className="flex-grow flex flex-col items-center justify-center py-24 px-10">
        <div className="w-20 h-20 bg-[#F9FAFB] rounded-full flex items-center justify-center mb-6 border border-gray-100">
            <span className="text-4xl font-black text-gray-200 italic">!</span>
        </div>
        <h2 className="text-2xl font-black text-gray-900 mb-2 tracking-tight text-center">
            {title}
        </h2>
        <p className="text-gray-400 font-medium text-center max-w-[320px] leading-relaxed">
            {description}
        </p>
    </div>
);

export default EmptyState;