import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

// Components
import Footer from "../layouts/Footer";
import LoginForm from "../components/ui/LoginForm";
import DemoCredentials from "../components/DemoCredential";

// Services & Assets
import { authService } from "../services/api";
import { Icons } from "../assets/icons";

const Login = () => {
  const navigate = useNavigate();

  // State for form inputs
  const [inputs, setInputs] = useState({ email: "", password: "" });

  // State for UI management (form, loading, error)
  const [uiState, setUiState] = useState("form");

  /**
   * Updates state on input change and clears errors
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInputs((prev) => ({ ...prev, [name]: value }));

    // Reset error state if user starts typing again
    if (uiState === "error") {
      setUiState("form");
    }
  };

  /**
   * Handles form submission and authentication service call
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setUiState("loading");

    try {
      const data = await authService.login(inputs);
      // Persist token and redirect to dashboard
      localStorage.setItem("token", data.token);
      navigate("/dashboard");
    } catch (error) {
      // Silence sensitive error details for security
      setUiState("error");
    }
  };

  return (
    <div className="grid min-h-screen grid-rows-[auto_1fr_auto] bg-[#F0F0F5]">
      {/* Header section with brand logo */}
      <header className="flex justify-center shrink-0">
        <img
          src={Icons.logos.large}
          alt="TalentMatch AI Logo"
          className="h-40 w-auto object-contain pt-10"
        />
      </header>

      {/* Main interaction area */}
      <main className="flex flex-col items-center justify-center pb-12 w-full px-6">
        {uiState === "loading" ? (
          /* Loading indicator during authentication */
          <div className="flex flex-col items-center justify-center gap-6 animate-pulse">
            <p className="text-xl font-medium text-gray-700 font-sans">Verifying...</p>
            <img
              src={Icons.auth.loading}
              alt="Loading"
              className="h-16 w-16 animate-spin opacity-80"
            />
          </div>
        ) : (
          /* Central container for Form and Demo information */
          <div className="w-full max-w-md flex flex-col items-center">
            <LoginForm
              inputs={inputs}
              onChange={handleInputChange}
              onSubmit={handleSubmit}
              uiState={uiState}
            />

            {/* Minimalist Demo Access display */}
            <DemoCredentials />
          </div>
        )}
      </main>

      {/* Persistent application footer */}
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
