import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

//Components
import Footer from "../layouts/Footer";
import LoginForm from "../components/ui/LoginForm";

// Services & Assets
import { authService } from "../services/api";
import { Icons } from "../assets/icons";

const Login = () => {
  const navigate = useNavigate();
  const [inputs, setInputs] = useState({ email: "", password: "" });
  const [uiState, setUiState] = useState("form");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInputs((prev) => ({ ...prev, [name]: value }));
     
    //reset the error if the user types again
    if (uiState === "error") {
      setUiState("form");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUiState("loading");
    
    try {
      const data = await authService.login(inputs);
      localStorage.setItem("token", data.token);
      navigate("/dashboard");
    } catch (error) {
      //avoid the log of sensitive errors
      setUiState("error");
    }
  };

  return (
    <div className="grid min-h-screen grid-rows-[1fr_auto] bg-[#F0F0F5]">
      <header className="flex justify-center">
        <img
          src={Icons.logos.large}
          alt="Logo"
          className="h-40 w-auto object-contain pt-10"
        />
      </header>

      <main className="flex flex-grow items-center justify-center pb-12 w-full px-6">
        {uiState === "loading" ? (
          <div className="flex flex-col items-center justify-center gap-6 animate-pulse">
            <p className="text-xl font-medium text-gray-700">Verificando...</p>
            <img
              src={Icons.auth.loading}
              alt="Cargando"
              className="h-16 w-16 animate-spin opacity-80"
            />
          </div>
        ) : (
          <LoginForm 
            inputs={inputs} 
            onChange={handleInputChange} 
            onSubmit={handleSubmit} 
            uiState={uiState} 
          />
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
