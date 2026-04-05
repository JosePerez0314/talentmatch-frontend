import React from "react";
import { useNavigate } from "react-router-dom";
// Assets
import { Icons } from "../../assets/icons";

/**
 * PositionSuccess Component
 * Displays a high-fidelity success state after creating a job position.
 * @param {string} positionName - The name of the recently created position.
 */
const PositionSuccess = ({ positionName = "Desarrollador React" }) => {
    const navigate = useNavigate();

    return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center animate-fade-in">

            {/* Central Success Card (Dark Theme as per Image) */}
            <div className="bg-[#2D2D2D] w-full max-w-2xl rounded-[32px] p-16 flex flex-col items-center justify-center text-center shadow-2xl mb-8 relative">

                {/* Success Icon Group */}
                <div className="flex items-center gap-4 mb-8">
                    <h2 className="text-white text-3xl font-medium tracking-tight">
                        Posición creada con éxito
                    </h2>
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg">
                        {/* Replace with your specific blue check icon */}
                        <span className="text-[#447ECA] text-xl font-bold">✓</span>
                    </div>
                </div>

                {/* Dynamic Position Text */}
                <p className="text-gray-400 text-lg">
                    "{positionName}" ha sido agregada al sistema.
                </p>

            </div>

            {/* Action Buttons Row */}
            <div className="flex w-full max-w-2xl justify-between items-center px-4">

                {/* Back to Menu Button */}
                <button
                    onClick={() => navigate("/dashboard")}
                    className="flex items-center gap-2 bg-white text-gray-600 px-6 py-3 rounded-xl font-bold border border-gray-100 shadow-sm hover:bg-gray-50 transition-all active:scale-95"
                >
                    <span className="text-lg">←</span>
                    Volver al menú
                </button>

                {/* Create Another Button */}
                <button
                    onClick={() => window.location.reload()} // Simply resets the state
                    className="bg-[#447ECA] text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-blue-900/20 hover:bg-[#356BB0] transition-all active:scale-95"
                >
                    Crear otra posición
                </button>

            </div>
        </div>
    );
};

export default PositionSuccess;