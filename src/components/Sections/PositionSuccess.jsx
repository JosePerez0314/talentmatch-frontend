import React from "react";
import { useNavigate } from "react-router-dom";
import { Icons } from "../../assets/icons/index";

/**
 * PositionSuccess Component
 * @param {string} positionName - Nombre de la posición creada.
 * @param {function} onReset - Función que cambia el estado en el padre para volver al formulario.
 */
const PositionSuccess = ({ positionName = "Desarrollador React", onReset }) => {
    const navigate = useNavigate();

    return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center animate-fade-in">
            {/* Tarjeta de éxito */}
            <div className="bg-[#2D2D2D] w-full max-w-2xl rounded-[32px] p-16 flex flex-col items-center justify-center text-center shadow-2xl mb-8 relative">
                <div className="flex items-center gap-4 mb-8">
                    <h2 className="text-white text-3xl font-medium tracking-tight">
                        Posición creada con éxito
                    </h2>
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg">
                        <img src={Icons.stats.checkBlue} alt="Check" className="w-7 h-7 object-contain" />
                    </div>
                </div>

                <p className="text-gray-400 text-lg">
                    "{positionName}" ha sido agregada al sistema.
                </p>
            </div>

            {/* Botones de acción */}
            <div className="flex w-full max-w-2xl justify-between items-center px-4">
                <button
                    onClick={() => navigate("/dashboard")}
                    className="flex items-center gap-2 bg-[#447ECA] text-white px-6 py-3 rounded-xl font-bold border border-gray-100 shadow-sm hover:bg-[#356BB0] transition-all active:scale-95"
                >
                    Volver al menú
                </button>

                <button
                    onClick={onReset} // <--- AQUÍ ESTÁ LA SOLUCIÓN: Llama a la función del padre
                    className="bg-[#447ECA] text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-blue-900/20 hover:bg-[#356BB0] transition-all active:scale-95"
                >
                    Crear otra posición
                </button>
            </div>
        </div>
    );
};

export default PositionSuccess;