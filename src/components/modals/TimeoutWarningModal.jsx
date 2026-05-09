import React, { useState, useEffect } from "react";
import { Icons } from "../../assets/icons";

const TimeoutWarningModal = ({ onContinue }) => {
    const [timeLeft, setTimeLeft] = useState(60);

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in px-4">
            <div className="bg-white w-full max-w-md rounded-[32px] p-10 shadow-2xl flex flex-col items-center text-center border border-red-100">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6">
                    <span className="text-red-500 font-black text-2xl">!</span>
                </div>
                
                <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-2">
                    Inactividad detectada
                </h2>
                <p className="text-gray-500 font-medium mb-8">
                    Tu sesión expirará en <strong className="text-red-500">{timeLeft} segundos</strong> por motivos de seguridad. ¿Deseas continuar?
                </p>

                <button 
                    onClick={onContinue}
                    className="w-full bg-[#447ECA] text-white py-4 rounded-xl font-bold shadow-lg hover:bg-[#3669ab] active:scale-95 transition-all text-sm uppercase tracking-wider"
                >
                    Continuar trabajando
                </button>
            </div>
        </div>
    );
};

export default TimeoutWarningModal;