import React, { useState, useEffect } from "react";

const ProcessingModal = () => {
    const [step, setStep] = useState(0);
    const steps = ["Analizando requisitos", "Evaluando experiencias", "Generando Match Score"];

    useEffect(() => {
        const timer = setInterval(() => {
            setStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
        }, 1500);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#F2F4F7]/80 backdrop-blur-md animate-fade-in p-4">

            {/* Ajuste de padding y altura mínima para mobile */}
            <div className="bg-[#313131] w-full max-w-[550px] min-h-[380px] md:min-h-[420px] rounded-[35px] md:rounded-[45px] flex flex-col items-center justify-center shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] px-6 md:px-10 border border-white/10 relative overflow-hidden">

                {/* Glow de profundidad */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-[#447ECA]/30 blur-xl"></div>

                {/* Tamaño de texto fluido */}
                <h2 className="text-white text-xl md:text-3xl font-bold mb-8 md:mb-10 tracking-tight text-center">
                    Procesando Documentos
                </h2>

                {/* Lista de pasos centrada en mobile */}
                <div className="flex flex-col items-start w-fit min-h-[100px] md:min-h-[120px] gap-4 mb-10">
                    {steps.map((text, index) => (
                        <div key={index} className="flex items-center gap-4 transition-all duration-500">
                            <div className={`w-2 h-2 rounded-full transition-all duration-500 ${index === step ? "bg-[#447ECA] shadow-[0_0_8px_#447ECA] animate-pulse" : "bg-gray-600 opacity-30"
                                }`} />
                            <p className={`text-sm md:text-lg transition-all duration-500 ${index === step
                                ? "text-[#447ECA] font-bold translate-x-2"
                                : "text-gray-500 font-medium opacity-40"
                                }`}>
                                {text}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Spinner escalado para mobile */}
                <div className="relative w-12 h-12 md:w-16 md:h-16 mb-10 md:mb-12">
                    <div className="absolute inset-0 border-[3px] border-white/5 rounded-full"></div>
                    <div className="absolute inset-0 border-[3px] border-t-[#447ECA] border-r-[#447ECA]/20 border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                </div>

                {/* Footer con tracking ajustado para que no se rompa en pantallas muy angostas */}
                <p className="text-gray-500 text-[8px] md:text-[10px] uppercase tracking-[2px] md:tracking-[4px] font-black opacity-30 pb-4 text-center">
                    TalentMatch Engine v1.0
                </p>
            </div>
        </div>
    );
};

export default ProcessingModal;