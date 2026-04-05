// src/features/layout/HistoryTable.jsx
import React from "react";

const HistoryTable = ({ data }) => (
    <div className="flex flex-col w-full">
        {/* Header de la tabla */}
        <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-white">
            <span className="text-gray-400 font-black text-[10px] uppercase tracking-[0.2em]">
                Nombre del documento
            </span>
            <div className="flex items-center gap-2 bg-[#E9F7FF] text-[#447ECA] px-4 py-2 rounded-xl border border-[#D1E9FF]">
                <span className="font-black text-xs uppercase tracking-tight">
                    {data.length} CVs Subidos
                </span>
            </div>
        </div>

        {/* Filas de la tabla */}
        <div className="divide-y divide-gray-50">
            {data.map((cv) => (
                <div key={cv.id} className="p-6 flex justify-between items-center hover:bg-[#F9FBFF] transition-colors group cursor-pointer">
                    <div className="flex items-center gap-5">
                        {/* Icono PDF */}
                        <div className="w-12 h-14 bg-[#F5FBFF] rounded-xl flex items-center justify-center border border-[#E9F7FF]">
                            <div className="w-5 h-7 border-2 border-[#447ECA] rounded-sm relative">
                                <div className="absolute top-1.5 left-1 w-2 h-[1.5px] bg-[#447ECA]"></div>
                            </div>
                        </div>
                        <div>
                            <p className="font-black text-gray-700 text-sm mb-0.5">{cv.name}</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                                Subido por: <span className="text-gray-500">{cv.user}</span>
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-10">
                        <span className="text-gray-400 text-xs font-black tracking-tighter">{cv.date}</span>
                        <button className="text-[#447ECA] opacity-40 group-hover:opacity-100 transition-opacity">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                        </button>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

export default HistoryTable;