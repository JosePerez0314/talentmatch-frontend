import React from "react";
//Assets
import { Icons } from "../assets/icons/index.js";

const HistoryTable = ({ data }) => {
    // Helper para dar formato a la fecha (ej: 10/03/2026)
    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        });
    };

    // Helper para extraer el nombre del archivo de la URL de Cloudinary
    const getFileName = (url) => {
        if (!url) return "Documento.pdf";
        // Divide por "/" y toma el último elemento
        return url.split('/').pop(); 
    };

    return (
        <div className="flex flex-col w-full">
            {/* Header de la tabla */}
            <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-white">
                <span className="text-gray-400 font-black text-[11px] uppercase tracking-[0.2em]">
                    Nombre del documento
                </span>
                
                {/* Badge de cantidad (Según diseño de la imagen) */}
                <div className="flex items-center gap-2 bg-[#DCF9FF] text-[#447ECA] px-4 py-2 rounded-xl">
                    <img src={Icons.stats.vacantCreateBlue} alt="CVs" className="w-5 h-5 brightness-0" style={{ filter: "invert(42%) sepia(85%) saturate(1212%) hue-rotate(189deg) brightness(91%) contrast(85%)" }} />
                    <span className="font-bold text-sm tracking-tight">
                        {data.length} CVs
                    </span>
                </div>
            </div>

            {/* Filas de la tabla */}
            <div className="divide-y divide-gray-50 overflow-y-auto max-h-[60vh] custom-scrollbar">
                {data.map((cv) => {
                    // Extraemos la información de forma segura
                    const payload = cv.rawApiPayload || {};
                    const fileName = getFileName(payload.cvUrl);
                    const candidateName = payload.fullName || cv.fullName || "Candidato Desconocido";
                    const formattedDate = formatDate(cv.createdAt);

                    return (
                        <div key={cv.id} className="px-8 py-5 flex justify-between items-center hover:bg-[#F9FBFF] transition-colors group">
                            <div className="flex items-center gap-5">
                                {/* Icono Documento */}
                                <img src={Icons.stats.vacantCreateBlue} alt="PDF" className="w-6 h-6 object-contain opacity-70" />
                                
                                <div className="flex flex-col">
                                    <p className="font-medium text-gray-700 text-[15px] mb-0.5">
                                        {fileName}
                                    </p>
                                    <p className="text-sm text-gray-400">
                                        {candidateName}
                                    </p>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-10">
                                <span className="text-gray-400 text-sm font-medium">
                                    {formattedDate}
                                </span>
                                {/* Botón Ver (Ojo) que abre el PDF en otra pestaña */}
                                <a 
                                    href={payload.cvUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-[#447ECA] hover:scale-110 transition-transform p-2"
                                    title="Ver CV"
                                >
                                    {/* Usa el icono del ojo de tus assets */}
                                    <img src={Icons.stats.eyeHistoryGray} alt="Ver" className="w-5 h-5 brightness-0" style={{ filter: "invert(42%) sepia(85%) saturate(1212%) hue-rotate(189deg) brightness(91%) contrast(85%)" }} />
                                </a>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default HistoryTable;