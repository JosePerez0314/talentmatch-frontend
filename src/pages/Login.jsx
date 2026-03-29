import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
//Iconos
import logoTalentMatch from "../assets/icons/Logo_TalentMatch_AI.png";
import mailIcon from "../assets/icons/icon_mail_login.png";
import passwIcon from "../assets/icons/icon_lock.png";
import loadingIcon from "../assets/icons/icon_loading_refresh.png";

const Login = () => {
  const navigate = useNavigate();
  const [inputs, setInputs] = useState({ email: "", password: "" });
  const [uiState, setUiState] = useState("form");

  // URL del backend
  const API_URL = "dsfsdf";

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInputs((prev) => ({ ...prev, [name]: value }));
    if (uiState === "error") setUiState("form");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUiState("loading");

    try {
      // Petición real al backend
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(inputs), // conversion de objeto a JSON
      });

      const data = await response.json();

      if (response.ok) {
        // todo bier, backend respondió con status 200
        console.log("Login exitoso:", data);
        
        // Guarda token en localStorage para mantener la sesión IMPORTANTE PARA MANTENER SECCION
        localStorage.setItem("token", data.token); 
        
        navigate("/dashboard"); //lleva al dashbor
      } else {
        //ERROR backend responde (400, 401, 500)
        console.error("Error de autenticación:", data.message);
        setUiState("error");
      }
    } catch (error) {
      // ERROR DE RED, servidor caído o no hay internet
      console.error("Error de conexión:", error);
      setUiState("error");
    }
  };

  return (
    <div className="grid min-h-screen grid-rows-[1fr_auto] bg-[#F0F0F5]">
      <header className="flex justify-center">
        <img src={logoTalentMatch} alt="Logo" className="h-40 w-auto object-contain pt-10" />
      </header>

      <main className="flex flex-grow items-center justify-center pb-12 w-full px-6">
        {uiState === "loading" ? (
          <div className="flex flex-col items-center justify-center gap-6 animate-pulse pb-50">
            <p className="text-xl font-medium text-gray-700">Verificando credenciales...</p>
            <img src={loadingIcon} alt="Cargando" className="h-16 w-16 animate-spin opacity-80" />
          </div>
        ) : (
          <div className="w-full max-w-[420px] bg-white rounded-[24px] p-10 shadow-sm border border-blue-50">
            <div className="text-center mb-10">
              <h1 className="text-3xl font-bold">Inicia Sesión</h1>
              <p className="text-[#447ECA] font-medium mt-2">TalentMatch AI</p>
            </div>

            {uiState === "error" && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-semibold text-center">
                Credenciales incorrectas o error de servidor.
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-400">Usuario</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <img src={mailIcon} className="h-5 w-5 opacity-40 group-focus-within:opacity-100" alt="" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={inputs.email}
                    onChange={handleInputChange}
                    placeholder="Correo Electrónico"
                    className="w-full py-4 pl-12 pr-6 border rounded-xl outline-none focus:ring-2 focus:ring-[#447ECA]/20 focus:border-[#447ECA]"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-400">Contraseña</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <img src={passwIcon} className="h-5 w-5 opacity-40 group-focus-within:opacity-100" alt="" />
                  </div>
                  <input
                    type="password"
                    name="password"
                    value={inputs.password}
                    onChange={handleInputChange}
                    placeholder="Contraseña"
                    className="w-full py-4 pl-12 pr-6 border rounded-xl outline-none focus:ring-2 focus:ring-[#447ECA]/20 focus:border-[#447ECA]"
                    required
                  />
                </div>
              </div>

              <button type="submit" className="w-full py-4 mt-2 bg-[#447ECA] text-white font-bold rounded-full hover:bg-[#3669ab] transition-all active:scale-[0.98]">
                Inicia sesión
              </button>
            </form>
          </div>
        )}
      </main>

      <footer className="bg-[#447ECA] py-5 text-white text-[13px] font-medium flex justify-between px-10">
        <p>Copyright 2024</p>
        <p>Contáctanos</p>
        <p>Ayuda</p>
      </footer>
    </div>
  );
};

export default Login;