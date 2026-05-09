import React from "react";
//Assets
import { Icons } from "../assets/icons/index.js";

const HistoryTable = ({ data }) => {
    // Helper to format the date (10/03/2026)
    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        });
    };

    const getFileName = (url) => {
        if (!url || typeof url !== 'string') return "Documento.pdf";
        return url.split('/').pop();
    };

    return (
        <div className="flex flex-col w-full">
            {/* Header of table */}
            <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-white">
                <span className="text-gray-400 font-black text-[11px] uppercase tracking-[0.2em]">
                    Nombre del documento
                </span>

                {/* Quantity badge*/}
                <div className="flex items-center gap-2 bg-[#DCF9FF] text-[#447ECA] px-4 py-2 rounded-xl">
                    <img src={Icons.stats.vacantCreateBlue} alt="CVs" className="w-5 h-5" style={{ filter: "invert(42%) sepia(85%) saturate(1212%) hue-rotate(189deg) brightness(91%) contrast(85%)" }} />
                    <span className="font-bold text-sm tracking-tight">
                        {data.length} CVs
                    </span>
                </div>
            </div>

            {/* Rows of the table */}
            <div className="divide-y divide-gray-50 overflow-y-auto max-h-[60vh] custom-scrollbar">
                {data.map((cv) => {
                    const fileUrl = cv.fileUrl || cv.cvUrl || (cv.rawApiPayload && (cv.rawApiPayload.cvUrl || cv.rawApiPayload.fileUrl));
                    const fileName = getFileName(fileUrl);
                    const candidateName = cv.fullName || (cv.rawApiPayload && cv.rawApiPayload.fullName) || "Candidato Desconocido";
                    const formattedDate = formatDate(cv.createdAt || cv.uploadDate);

                    return (
                        <div key={cv.id} className="px-8 py-5 flex justify-between items-center hover:bg-[#F9FBFF] transition-colors group">

                            {/* COLUMNA IZQUIERDA: Nombre y Documento (65% del ancho para dar espacio) */}
                            <div className="flex items-center gap-5 w-[65%] overflow-hidden">
                                <img src={Icons.stats.vacantCreateBlue} alt="PDF" className="w-6 h-6 object-contain opacity-70 flex-shrink-0" />

                                <div className="flex flex-col text-left overflow-hidden">
                                    <p className="font-medium text-gray-700 text-[15px] mb-0.5 truncate" title={fileName}>
                                        {fileName}
                                    </p>
                                    <p className="text-sm text-gray-400 truncate" title={candidateName}>
                                        {candidateName}
                                    </p>
                                </div>
                            </div>

                            {/* COLUMNA DERECHA: Fecha y Acción (Ancho fijo para que no se mueva) */}
                            <div className="flex items-center gap-8 justify-end flex-shrink-0">
                                <span className="text-gray-400 text-sm font-medium">
                                    {formattedDate}
                                </span>

                                <a
                                    href={fileUrl || "#"}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="transition-all duration-200 p-2 rounded-lg hover:bg-blue-50 group/eye flex-shrink-0"
                                    title={fileUrl ? "Ver CV" : "Documento no disponible"}
                                    onClick={(e) => !fileUrl && e.preventDefault()}
                                >
                                    <img
                                        src={Icons.stats.eyeHistoryGray}
                                        alt="Ver"
                                        className="w-5 h-5"
                                        style={{
                                            filter: "invert(42%) sepia(85%) saturate(1212%) hue-rotate(189deg) brightness(91%) contrast(85%)",
                                            opacity: "1",
                                            display: "block"
                                        }}
                                    />
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