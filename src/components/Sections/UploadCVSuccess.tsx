import React from "react";
import { useNavigate } from "react-router-dom";
import { Icons } from "../../assets/icons/index";
import { UploadResult } from "../../types/api.types";

interface UploadCVSuccessProps {
    results: UploadResult[];
    fileNames: string[];
    onReset: () => void;
}

const UploadCVSuccess: React.FC<UploadCVSuccessProps> = ({ results, fileNames, onReset }) => {
    const navigate = useNavigate();

    const processedCount = results.filter((r) => r.success).length;
    const failedCount = results.length - processedCount;

    const summary = failedCount === 0
        ? `${processedCount} CVs procesados exitosamente`
        : `${processedCount} procesados · ${failedCount} con error`;

    return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center animate-fade-in px-6">
            <div className="bg-[#2D2D2D] w-full max-w-2xl rounded-[32px] p-12 flex flex-col items-center justify-center text-center shadow-2xl mb-8 relative">
                <div className="flex items-center gap-4 mb-6">
                    <h2 className="text-white text-3xl font-medium tracking-tight">
                        Documentos cargados
                    </h2>
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg">
                        <img src={Icons.stats.checkBlue} alt="Check" className="w-7 h-7 object-contain" />
                    </div>
                </div>

                <p className="text-gray-300 text-lg mb-6">{summary}</p>

                {results.length > 0 && (
                    <ul className="w-full max-h-64 overflow-y-auto text-left divide-y divide-white/10 bg-white/5 rounded-2xl px-4">
                        {results.map((result, index) => {
                            const name = fileNames[index] ?? `Archivo #${index + 1}`;
                            const ok = result.success;
                            return (
                                <li key={`${name}-${index}`} className="flex items-start justify-between gap-4 py-3">
                                    <span className="text-gray-200 text-sm truncate flex-1">{name}</span>
                                    <span
                                        className={`text-[11px] font-bold uppercase tracking-wider shrink-0 ${ok ? "text-emerald-400" : "text-red-400"}`}
                                    >
                                        {ok ? "Procesado" : "Error"}
                                    </span>
                                    {!ok && result.message && (
                                        <span className="text-red-300 text-[11px] italic max-w-[45%] truncate" title={result.message}>
                                            {result.message}
                                        </span>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>

            <div className="flex w-full max-w-2xl justify-between items-center px-4">
                <button
                    onClick={() => navigate("/dashboard")}
                    className="flex items-center gap-2 bg-white text-gray-600 px-6 py-3 rounded-xl font-bold border border-gray-100 shadow-sm hover:bg-gray-50 transition-all active:scale-95">
                    <span className="text-lg">←</span>
                    Volver al menú
                </button>

                <button
                    onClick={onReset}
                    className="bg-[#447ECA] text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-blue-900/20 hover:bg-[#356BB0] transition-all active:scale-95">
                    Subir más CVs
                </button>
            </div>
        </div>
    );
};

export default UploadCVSuccess;
