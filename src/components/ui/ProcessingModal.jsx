import React, { useState, useEffect } from "react";
import { Icons } from "../../assets/icons/index.js";

const ProcessingModal = () => {
    const [step, setStep] = useState(0);
    const steps = ["Analizando requisitos", "Evaluando experiencias"];

    useEffect(() => {
        const timer = setInterval(() => {
            setStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
        }, 2000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#F2F4F7] animate-fade-in">
            {/* Contenedor Oscuro Principal */}
            <div className="bg-[#313131] w-[90%] max-w-[700px] aspect-video rounded-[45px] flex flex-col items-center justify-center shadow-2xl px-10">

                <h2 className="text-white text-2xl md:text-3xl font-bold mb-10 tracking-tight">
                    Procesando Documentos
                </h2>

                {/* Textos Secuenciales en Gris */}
                <div className="flex flex-col items-center gap-2 mb-12">
                    {steps.map((text, index) => (
                        <p
                            key={index}
                            className={`text-lg transition-all duration-500 ${index === step ? "text-[#447ECA] font-semibold" : "text-gray-500 font-medium"
                                }`}>
                            {text}
                        </p>
                    ))}
                </div>

                {/* Spinner Circular Azul Personalizado (CSS Puro para evitar errores de imagen) */}
                <div className="relative w-16 h-16">
                    {/* Círculo de fondo */}
                    <div className="absolute inset-0 border-[6px] border-gray-600 rounded-full"></div>
                    {/* Círculo animado azul */}
                    <div className="absolute inset-0 border-[6px] border-t-[#447ECA] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                </div>
            </div>
        </div>
    );
};

export default ProcessingModal;