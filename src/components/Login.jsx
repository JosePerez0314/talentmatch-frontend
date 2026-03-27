import React from "react";
import logoTalentMatch from "../assets/icons/Logo_TalentMatch_AI.png"
import userIcon from "../assets/icons/icon_user.png"
import passwIcon from "../assets/icons/icon_lock.png"

const Login = () => {
    return (
        /*Grid de 2 filas: la primera expandible (1fr) y la segunda para el footer (auto)*/
        <div className="grid min-h-screen grid-rows-[1fr_auto] bg-[#F0F0F5]">

                {/* 1. Logo Superior: Centrado y con espacio */}
                <header className=" flex justify-center">
                    <img src={logoTalentMatch} alt="TalentMatch AI Logo" className="h-40 w-auto object-contain pt-10"/>
                </header>

            {/*Seccion de arriba: Centrado del login*/}
            <main className="flex items-center justify-center pb-6">
                <div className="w-full max-w-[420px] bg-[#FFFFFF] rounded-[24px] p-10 shadow-sm border border-blue-50">

                    {/*Campo Encabezado*/}
                    <div className="text-center mb-10">
                        <h1 className="text-3xl font-bold text-black tracking-tight">Inicia Sesion</h1>
                        <p className="text-[#447ECA] font-medium mt-2">TalentMatch AI</p>
                    </div>

                    {/*Campo Form*/}
                    <form className="flex flex-col gap-5">

                        {/* Campo Usuario con icono*/}
                        <div className="flex flex-col gap-2">
                            <label className="text-sans serif font-medium text-gray-400 ml-1">Usuario</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <img src={userIcon} alt="" className="h-5 w-5 opacity-40 group-focus-within:opacity-100 transition-opacity" />
                                </div>
                                    <input type="text" 
                                    placeholder="Usuario" 
                                    className="w-full py-4 pl-12 pr-6 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#447ECA]/20 focus:border-[#447ECA] transition-all"
                                    />
                            </div>
                        </div>

                        {/* Campo Contraseña con icono*/}
                        <div className="flex flex-col gap-2">
                            <label className="text-sans serif font-medium text-gray-400 ml-1">Contraseña</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <img src={passwIcon} alt="" className="h-5 w-5 opacity-40 group-focus-within:opacity-100 transition-opacity" />
                                </div>
                                    <input
                                    type="password"
                                    placeholder="Contraseña"
                                    className="w-full py-4 pl-12 pr-6 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#447ECA]/20 focus:border-[#447ECA] transition-all"
                                    />
                            </div>
                        </div>

                        {/* Botón Iniciar Sesión */}
                        <button
                            type="submit"
                            className="w-full py-4 mt-2 bg-[#447ECA] text-white font-bold rounded-full hover:bg-[#3669ab] transition-all shadow-md active:scale-[0.98]">
                            Inicia sesión
                        </button>
                    </form>
                </div>
            </main>

            {/*footer*/}
            <footer className="bg-[#447ECA] py-5">
                <div className="flex justify-between items-center w-full px-10 text-white text-[13px] font-medium">
                    <p>Copyright</p>
                    <p>Contactanos</p>
                    <p>Ayuda</p>
                </div>
            </footer>
        </div>
    );
};

export default Login;