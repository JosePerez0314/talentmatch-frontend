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


 
  const { login } = useAuth();

  const [inputs, setInputs] = useState({ email: "", password: "" });
  const [uiState, setUiState] = useState("form");


  
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

  /**
   * Maneja el envío del formulario de forma asíncrona hacia el backend real
   */
  const handleSubmit = async (e) => {
  e.preventDefault();
  setUiState("loading");

  try {
    // 1. Llamamos al servicio (que ahora devuelve responseBody.data)
    const data = await authService.login(inputs);
    
    // 2. GUARDADO CRÍTICO: Guardamos el objeto de usuario completo
    // Según tu JSON, 'data' debería traer { id, email, ... }
    if (data) {
      localStorage.setItem("user", JSON.stringify(data));
      
      // Si el backend también manda token (aunque no lo usemos en headers), 
      // es bueno guardarlo por si acaso
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
      {/* Header section with brand logo */}

      <header className="flex justify-center shrink-0">
        <img
          src={Icons.logos.large}
          alt="TalentMatch AI Logo"
          className="h-40 w-auto object-contain pt-10"
        />
      </header>


      <main className="flex flex-col items-center justify-center pb-12 w-full px-6">
        {uiState === "loading" ? (

      {/* Main interaction area */}
      <main className="flex flex-col items-center justify-center pb-12 w-full px-6">
        {uiState === "loading" ? (
          /* Loading indicator during authentication */

          <div className="flex flex-col items-center justify-center gap-6 animate-pulse">
            <p className="text-xl font-medium text-gray-700 font-sans">Verificando...</p>
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

