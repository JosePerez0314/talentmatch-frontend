import React from "react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import logoTalentMatch from "../assets/icons/Logo_TalentMatch_AI.png"
import mailIcon from "../assets/icons/icon_mail_login.png"
import passwIcon from "../assets/icons/icon_lock.png"
import loadingIcon from "../assets/icons/icon_loading_refresh.png"

const Login = () => {
  const navigate = useNavigate();
  // 1. ESTADOS PRINCIPALES
  // Guardamos las entradas del usuario
  const [inputs, setInputs] = useState({ email: "", password: "" });
  // Controlamos la UI: 'form' (mostrar login), 'loading' (mostrar carga), 'error' (credenciales incorrectas)
  const [uiState, setUiState] = useState("form");

  // 2. MANEJO DE INPUTS
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Actualizamos el valor
    setInputs((prev) => ({ ...prev, [name]: value }));

    // UX Pro: Si el usuario estaba en estado de error y vuelve a escribir, 
    // quitamos el mensaje de error inmediatamente.
    if (uiState === "error") {
      setUiState("form");
    }
  };

  // 3. LÓGICA DE CONEXIÓN AL BACKEND
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Pasamos a estado de carga (oculta el form, muestra el spinner centrado)
    setUiState("loading");

    // --- COMIENZO ZONA BACKEND ---
    // Esta sección simula la llamada a la API.
    // Cuando tengas tu backend real, solo cambias este bloque try/catch.

    try {
      // Simulamos latencia de red de 2.5 segundos
      await new Promise(resolve => setTimeout(resolve, 2500));

      // SIMULACIÓN DE LÓGICA DE NEGOCIO:
      // Probamos con: usuario: admin@talent.ai / clave: admin123
      if (inputs.email === "admin@talent.ai" && inputs.password === "admin123") {
        // ÉXITO
        console.log("Login Correcto. Redireccionando...");
        // Aquí usarías navigate('/dashboard') de react-router o window.location
        navigate('/dashboard');
        // Por seguridad, si te quedas en la página, vuelve a form
        setUiState("form");
      } else {
        // FALLO DE AUTENTICACIÓN
        console.warn("Credenciales incorrectas.");
        setUiState("error"); // Vuelve automáticamente al form y muestra el mensaje rojo
      }
    } catch (error) {
      // ERROR DE RED O SERVIDOR
      console.error("Error de conexión:", error);
      setUiState("error"); // O podrías crear un estado 'server_error' específico
    }
    // --- FINAL ZONA BACKEND ---
  };


  return (
    /*Grid de 2 filas: la primera expandible (1fr) y la segunda para el footer (auto)*/
    <div className="grid min-h-screen grid-rows-[1fr_auto] bg-[#F0F0F5]">

      {/* 1. Logo Superior: Centrado y con espacio */}
      <header className=" flex justify-center">
        <img src={logoTalentMatch} alt="TalentMatch AI Logo" className="h-40 w-auto object-contain pt-10" />
      </header>

      {/* CONTENIDO DINÁMICO SEGÚN EL ESTADO */}
      <main className="flex flex-grow items-center justify-center pb-12 w-full px-6">

        {/* A. VISTA DE CARGA (uiState === 'loading') */}
        {uiState === "loading" && (
          <div className="flex flex-col items-center justify-center gap-6 animate-fade-in pb-50">
            <p className="text-xl font-medium text-gray-700 text-center tracking-tight">
              Verificando clave, por favor espere...
            </p>
            {/* Icono de carga con animación de rotación infinita hacia la derecha */}
            <img
              src={loadingIcon}
              alt="Cargando"
              className="h-16 w-16 animate-spin opacity-80" // 'animate-spin' hace la magia en Tailwind
            />
          </div>
        )}

        {/* B. VISTA DE FORMULARIO (uiState === 'form' o 'error') */}
        {(uiState === "form" || uiState === "error") && (
          <div className="w-full max-w-[420px] bg-[#FFFFFF] rounded-[24px] p-10 shadow-sm border border-blue-50 animate-fade-in">

            {/* Campo Encabezado */}
            <div className="text-center mb-10">
              <h1 className="text-3xl font-bold text-black tracking-tight">Inicia Sesion</h1>
              <p className="text-[#447ECA] font-medium mt-2">TalentMatch AI</p>
            </div>

            {/* UX Pro: Mensaje de error (solo si uiState es 'error') */}
            {uiState === "error" && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-600 text-sm font-semibold text-center">
                  Credenciales incorrectas. Intenta de nuevo.
                </p>
              </div>
            )}

            {/* Campo Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">

              {/* Campo Usuario */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-400 ml-1">Usuario</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <img src={mailIcon} alt="" className="h-5 w-5 opacity-40 group-focus-within:opacity-100 transition-opacity" />
                  </div>
                  <input
                    type="email"
                    name="email" // Importante para handleInputChange
                    value={inputs.email} // Value controlado
                    onChange={handleInputChange} // Handler único
                    placeholder="Correo Electronico"
                    className={`w-full py-4 pl-12 pr-6 bg-white border rounded-xl outline-none transition-all focus:ring-2 
                        ${uiState === 'error' ? 'border-red-300 focus:ring-red-100' : 'border-gray-200 focus:ring-[#447ECA]/20 focus:border-[#447ECA]'}`}
                    required
                  />
                </div>
              </div>

              {/* Campo Contraseña */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-400 ml-1">Contraseña</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <img src={passwIcon} alt="" className="h-5 w-5 opacity-40 group-focus-within:opacity-100 transition-opacity" />
                  </div>
                  <input
                    type="password"
                    name="password" // Importante
                    value={inputs.password} // Value controlado
                    onChange={handleInputChange} // Handler único
                    placeholder="Contraseña"
                    className={`w-full py-4 pl-12 pr-6 bg-white border rounded-xl outline-none transition-all focus:ring-2 
                        ${uiState === 'error' ? 'border-red-300 focus:ring-red-100' : 'border-gray-200 focus:ring-[#447ECA]/20 focus:border-[#447ECA]'}`}
                    required
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
        )}
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