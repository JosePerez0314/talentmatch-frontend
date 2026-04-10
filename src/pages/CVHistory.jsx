import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

//Components
import EmptyState from "../components/EmptyState";
import HistoryTable from "../components/HistoryTable";

//Assets and Services
import { Icons } from "../assets/icons/index.js";
import { candidateService } from "../services/api";

const CVHistory = () => {
    const navigate = useNavigate();

    // Estados
    const [cvs, setCvs] = useState([]);
    const [isLoading, setIsLoading] = useState(true); // Iniciamos en true para cargar al montar
    const [error, setError] = useState(null);

    // Fetching de datos
    useEffect(() => {
        const fetchCandidates = async () => {
            try {
                const data = await candidateService.getAll();
                setCvs(data || []);
            } catch (err) {
                console.error("Error al obtener candidatos:", err);
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCandidates();
    }, []);

    return (
        <div className="p-10 animate-fade-in max-w-5xl mx-auto flex flex-col min-h-screen text-left relative">

            {/* BOTÓN VOLVER */}
            <div className="flex justify-start mb-6">
                <button
                    type="button"
                    onClick={() => navigate("/dashboard")}
                    className="flex items-center gap-2 bg-[#447ECA] text-white px-6 py-2.5 rounded-xl font-bold shadow-md hover:bg-[#3669ab] active:scale-95 transition-all uppercase text-xs tracking-wider cursor-pointer">
                    Volver
                </button>
            </div>

            <header className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-black text-gray-800 tracking-tight">
                    Historial de CVs
                </h1>
            </header>

            {/* Estado de Error (Opcional, pero buena práctica) */}
            {error && (
                <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-bold border border-red-100">
                    Error: {error}
                </div>
            )}

            {/* Contenedor Principal */}
            <section className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden flex-grow flex flex-col relative pb-20">
                {isLoading ? (
                    // Estado de Carga
                    <div className="flex flex-col items-center justify-center flex-grow py-20 gap-4">
                        <img src={Icons.auth.loading} alt="Cargando" className="w-10 h-10 animate-spin opacity-50" />
                        <p className="text-gray-500 font-medium">Cargando historial de candidatos...</p>
                    </div>
                ) : cvs.length > 0 ? (
                    // Tabla de Datos
                    <HistoryTable data={cvs} />
                ) : (
                    // Estado Vacío
                    <EmptyState />
                )}

                {/* Botón flotante "Subir más CVs" (Solo si hay datos y no está cargando) */}
                {!isLoading && cvs.length > 0 && (
                    <div className="absolute bottom-6 right-6">
                        <button
                            onClick={() => navigate("/uploadcv")}
                            className="flex items-center gap-2 bg-[#447ECA] text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-[#356BB0] active:scale-95 transition-all text-sm"
                        >
                            {/* Icono de subida en blanco */}
                            <img src={Icons.stats.uploadCv} alt="Subir" className="w-5 h-5 brightness-0 invert" />
                            Subir más CVs
                        </button>
                    </div>
                )}
            </section>
        </div>
    );
};

export default CVHistory;