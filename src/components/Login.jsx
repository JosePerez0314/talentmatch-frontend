import React from "react";

const Login = () => {
    return (
        /*Grid de 2 filas: la primera expandible (1fr) y la segunda para el footer (auto)*/
        <div className="grid min-h-screen grid-rows-[1fr_auto]">

            {/*Seccion de arriba: Centrado del login*/}
            <main className="flex items-center justify-center p-6">
                <div className="w-full max-w-[420px] bg-[#DCF9FF] rounded-[24px] p-10 shadow-sm border border-blue-50">

                    {/*Campo Encabezado*/}
                    <div className="text-center mb-10">
                        <h1 className="text-3xl font-bold text-black tracking-tight">Inicia Sesion</h1>
                        <p className="text-[#447ECA] font-medium mt-2">TalentMatch Ai</p>
                    </div>

                    {/*Campo Form*/}
                    <form className="flex flex-col gap-5">

                        {/* Campo Usuario */}
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Usuario"
                                className="w-full p-4 px-6 bg-white border-none rounded-full outline-none shadow-sm transition-all placeholder:text-gray-400 focus:ring-2 focus:ring-black/40"
                            />
                        </div>

                        {/* Campo Contraseña */}
                        <div className="relative">
                            <input
                                type="password"
                                placeholder="Contraseña"
                                className="w-full p-4 px-6 bg-white border-none rounded-full outline-none shadow-sm transition-all placeholder:text-gray-400 focus:ring-2 focus:ring-black/40"
                            />
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