import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

// Components
import Footer from "../layouts/Footer";
import LoginForm from "../components/ui/LoginForm";
import DemoCredentials from "../components/DemoCredential";

// 1. IMPORTACIÓN DEL CONTEXTO
import { useAuth } from "../context/AuthContext";

// Services & Assets
import { authService } from "../services/api";
import { Icons } from "../assets/icons";

const Login = () => {
  const navigate = useNavigate();

  // 2. EXTRAEMOS LA FUNCIÓN LOGIN DEL CONTEXTO
  const { login } = useAuth();

  const [inputs, setInputs] = useState({ email: "", password: "" });
  const [uiState, setUiState] = useState("form");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInputs((prev) => ({ ...prev, [name]: value }));

    if (uiState === "error") {
      setUiState("form");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUiState("loading");

    try {
      // 3. LLAMADA AL BACKEND REAL
      const data = await authService.login(inputs);

      if (data) {
        // 4. GUARDADO EN EL CONTEXTO (Esto hace el split del email y persiste la sesión)
        // Usamos data.email que viene del backend
        login(data.email);

        // El localStorage.setItem("token") puedes dejarlo aquí o moverlo al AuthContext
        if (data.token) localStorage.setItem("token", data.token);

        navigate("/dashboard");
      } else {
        throw new Error("No se recibieron datos del usuario.");
      }

    } catch (error) {
      console.error("Fallo de Autenticación:", error.message);
      setUiState("error");
    }
  };

  return (
    <div className="grid min-h-screen grid-rows-[auto_1fr_auto] bg-[#F0F0F5]">
      <header className="flex justify-center shrink-0">
        <img
          src={Icons.logos.large}
          alt="TalentMatch AI Logo"
          className="h-40 w-auto object-contain pt-10"
        />
      </header>

      <main className="flex flex-col items-center justify-center pb-12 w-full px-6">
        {uiState === "loading" ? (
          <div className="flex flex-col items-center justify-center gap-6 animate-pulse">
            <p className="text-xl font-medium text-gray-700 font-sans">Verificando...</p>
            <img
              src={Icons.auth.loading}
              alt="Loading"
              className="h-16 w-16 animate-spin opacity-80"
            />
          </div>
        ) : (
          <div className="w-full max-w-md flex flex-col items-center">
            <LoginForm
              inputs={inputs}
              onChange={handleInputChange}
              onSubmit={handleSubmit}
              uiState={uiState}
            />
            <DemoCredentials />
          </div>
        )}
      </main>

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
