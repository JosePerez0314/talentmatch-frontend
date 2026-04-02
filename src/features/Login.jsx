import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
//Components
import Footer from "../components/Footer/Footer";
import AuthInput from "../components/AuthInput";
//Services
import { authService } from "../services/api";
//Assets

// Revisar si se puede optimizar
import logoTalentMatch from "../assets/icons/Logo_TalentMatch_AI.svg";
import mailIcon from "../assets/icons/icon_mail_login.svg";
import passwIcon from "../assets/icons/icon_lock.svg";
import loadingIcon from "../assets/icons/icon_loading_refresh.svg";

const Login = () => {
  const navigate = useNavigate();
  const [inputs, setInputs] = useState({ email: "", password: "" });
  const [uiState, setUiState] = useState("form");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInputs((prev) => ({ ...prev, [name]: value }));
    // Clear error message if user starts typing again
    if (uiState === "error") setUiState("form"); // Les dejare un ejemploConfirmar si esto se ejecuta porque el if falta un return
    // Ejemplo de implementacion

    if (uiState === "error") return setUiState("form"); // revisar si la logica es correcta
  };

  /**
   * Handles form submission to the authentication service
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setUiState("loading");

    try {
      // Llamada limpia al servicio centralizado
      const data = await authService.login(inputs);

      // Si llegamos aquí, el login fue exitoso
      localStorage.setItem("token", data.token);
      navigate("/dashboard");
    } catch (error) {
      // Cualquier error (401, 500, Red) cae aquí\
      console.error("error que si yo que", error); // Ejemplo de como utilizar el catch pero revisar la implementacion de forma correcta
      setUiState("error");
    }
  };

  // Implementacion de componente en el registro del login

  return (
    <div className="grid min-h-screen grid-rows-[1fr_auto] bg-[#F0F0F5]">
      <header className="flex justify-center">
        <img
          src={logoTalentMatch}
          alt="Logo"
          className="h-40 w-auto object-contain pt-10"
        />
      </header>

      <main className="flex flex-grow items-center justify-center pb-12 w-full px-6">
        {uiState === "loading" ? (
          <div className="flex flex-col items-center justify-center gap-6 animate-pulse pb-50">
            <p className="text-xl font-medium text-gray-700">
              Verificando credenciales...
            </p>
            <img
              src={loadingIcon}
              alt="Cargando"
              className="h-16 w-16 animate-spin opacity-80"
            />
          </div>
        ) : (
          <div className="w-full max-w-[420px] bg-white rounded-[24px] p-10 shadow-sm border border-blue-50">
            <div className="text-center mb-10">
              <h1 className="text-3xl font-bold">Inicia Sesión</h1>
              <p className="text-[#447ECA] font-medium mt-2">TalentMatch AI</p>
            </div>

            {uiState === "error" && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-semibold text-center">
                Credenciales incorrectas.
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {/* --- IMPLEMENTATION DRY AUTHINPUT --- */}
              <AuthInput
                label="Usuario"
                name="email"
                type="email"
                placeholder="Correo Electrónico"
                icon={mailIcon}
                value={inputs.email}
                onChange={handleInputChange}
                required
              />

              <AuthInput
                label="Contraseña"
                name="password"
                type="password"
                placeholder="Contraseña"
                icon={passwIcon}
                value={inputs.password}
                onChange={handleInputChange}
                required
              />

              <button
                type="submit"
                className="w-full py-4 mt-2 bg-[#447ECA] text-white font-bold rounded-full hover:bg-[#3669ab] transition-all active:scale-[0.98]"
              >
                Inicia sesión
              </button>
            </form>
          </div>
        )}
      </main>
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Login;

{
  /* REVISIÓN DE CÓDIGO & ARQUITECTURA - TALENTMATCH AI (Nivel Senior)

  3. COLORES "HARDCODEADOS" EN TAILWIND:
     - El Error: Escribir el hexadecimal [#447ECA] directamente en las clases por todo 
       el archivo es inmanejable. Si mañana el azul corporativo cambia, habrá que 
       reemplazarlo en 50 archivos.
     - La Solución: Configurar tailwind.config.js con primary: '#447ECA'. 
       Así solo usamos bg-primary y text-primary.

*/
}
