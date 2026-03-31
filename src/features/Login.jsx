// Implementar comentarios en ingles

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
//Icons
import logoTalentMatch from "../assets/icons/Logo_TalentMatch_AI.svg";
import mailIcon from "../assets/icons/icon_mail_login.svg";
import passwIcon from "../assets/icons/icon_lock.svg";
import loadingIcon from "../assets/icons/icon_loading_refresh.svg";

// Implementar return dentro de los condicionales y funciones
// ¿Qué deben cambiar?: El componente Login hace toda la lógica pero se les olvidó devolver la interfaz gráfica. Necesitan agregar el bloque return ( <JSX> ); al final de la función Login. Si ejecutas este código ahora mismo, la pantalla se quedará totalmente en blanco o React lanzará un error porque la función devuelve undefined.

const Login = () => {
  const navigate = useNavigate();
  const [inputs, setInputs] = useState({ email: "", password: "" });
  const [uiState, setUiState] = useState("form");

  // ¿Dónde está el error?: En la línea const API_URL = "dsfsdf"; y dentro del fetch.
  // ¿Qué deben cambiar?: ¡Nunca se escriben strings al azar ni URLs directamente en el componente! Exígeles que usen variables de entorno (por ejemplo, import.meta.env.VITE_API_URL). Además, diles que ese fetch completo debería estar en un archivo de servicios centralizado (ej. src/services/api.js) usando la configuración que tú dejaste lista en el backend. Si dejan el fetch ahí, tendrán que repetir los headers y la lógica del token en cada pantalla de TalentMatch AI.
  const API_URL = "dsfsdf";

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInputs((prev) => ({ ...prev, [name]: value }));
    if (uiState === "error") setUiState("form");
  };

  //
  return (

    <div className="grid min-h-screen grid-rows-[1fr_auto] bg-[#F0F0F5]">
      <header className="flex justify-center">
        <img
          src={logoTalentMatch}
          alt="Logo"
          className="h-40 w-auto object-contain pt-10"
        />

        {/**1. Corrección sobre tu comentario: El Footer no es un "Feature"
Tu directriz: "Muévanlo a un feature como footer.jsx".

La corrección Senior: Un Footer no pertenece a la carpeta /features. Es un componente de interfaz compartido. Debe ir en src/components/Footer/Footer.jsx o formar parte de un src/layouts/AuthLayout.jsx.

2. Violación masiva del Principio DRY (Don't Repeat Yourself)
El Error: Mira los bloques de código para el Usuario y la Contraseña. Son copias exactas. Tienen los mismos div relative group, las mismas clases enormes de Tailwind (w-full py-4 pl-12 pr-6 border rounded-xl...) y la misma estructura.

La Solución: Oblígalos a crear un componente reutilizable llamado <AuthInput />. El JSX de este formulario debería verse limpio, así:

JavaScript
<AuthInput name="email" type="email" label="Usuario" icon={mailIcon} value={inputs.email} onChange={handleInputChange} />
<AuthInput name="password" type="password" label="Contraseña" icon={passwIcon} value={inputs.password} onChange={handleInputChange} />
3. Colores "Hardcodeados" en Tailwind
El Error: Están escribiendo el color hexadecimal [#447ECA] directamente en las clases (ej. bg-[#447ECA], text-[#447ECA], focus:border-[#447ECA]) por todo el archivo.

La Solución: Esto es inmanejable. Si mañana decides cambiar el azul corporativo de TalentMatch AI, tendrán que buscar y reemplazar ese hexadecimal en 50 archivos distintos. Exígeles que configuren el archivo tailwind.config.js y agreguen este color como primary: '#447ECA'. Así solo tendrán que escribir bg-primary y text-primary.

4. El Copyright viaja en el tiempo
El Error: El Footer dice <p>Copyright 2024</p>. Estamos en el 2026.

La Solución: Nunca se escribe el año de forma estática. Debe ser dinámico usando JavaScript puro: <p>Copyright {new Date().getFullYear()}</p>. */}
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
                Credenciales incorrectas o error de servidor.
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-400">
                  Usuario
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <img
                      src={mailIcon}
                      className="h-5 w-5 opacity-40 group-focus-within:opacity-100"
                      alt=""
                    />
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
                <label className="text-sm font-medium text-gray-400">
                  Contraseña
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <img
                      src={passwIcon}
                      className="h-5 w-5 opacity-40 group-focus-within:opacity-100"
                      alt=""
                    />
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

      {/* Implementarlo aparte, no puedo ir dentro del footer*/}
      <footer className="bg-[#447ECA] py-5 text-white text-[13px] font-medium flex justify-between px-10">
        <p>Copyright 2024</p>
        <p>Contáctanos</p>
        <p>Ayuda</p>
      </footer>
    </div>
  );
};

export default Login;

{/* ==========================================================================
  REVISIÓN DE CÓDIGO & ARQUITECTURA - TALENTMATCH AI (Nivel Senior)
  ==========================================================================

  1. CORRECCIÓN SOBRE TU COMENTARIO: EL FOOTER NO ES UN "FEATURE"
     - Tu directriz: "Muévanlo a un feature como footer.jsx".
     - La corrección Senior: Un Footer no pertenece a la carpeta /features. Es un 
       componente de interfaz compartido. Debe ir en src/components/Footer/Footer.jsx 
       o formar parte de un src/layouts/AuthLayout.jsx.

  2. VIOLACIÓN MASIVA DEL PRINCIPIO DRY (DON'T REPEAT YOURSELF):
     - El Error: Los bloques de código para el Usuario y la Contraseña son copias exactas. 
       Tienen los mismos div relative group, las mismas clases enormes de Tailwind 
       (w-full py-4 pl-12 pr-6 border rounded-xl...) y la misma estructura.
     - La Solución: Crear un componente reutilizable llamado <AuthInput />. El JSX de 
       este formulario debería verse limpio:
       <AuthInput name="email" label="Usuario" icon={mailIcon} ... />

  3. COLORES "HARDCODEADOS" EN TAILWIND:
     - El Error: Escribir el hexadecimal [#447ECA] directamente en las clases por todo 
       el archivo es inmanejable. Si mañana el azul corporativo cambia, habrá que 
       reemplazarlo en 50 archivos.
     - La Solución: Configurar tailwind.config.js con primary: '#447ECA'. 
       Así solo usamos bg-primary y text-primary.

  4. EL COPYRIGHT VIAJA EN EL TIEMPO:
     - El Error: El Footer dice <p>Copyright 2024</p>. Estamos en el 2026.
     - La Solución: Nunca se escribe el año de forma estática. Debe ser dinámico:
       <p>Copyright {new Date().getFullYear()}</p>.

  5. SOBRE LA IMPLEMENTACIÓN DEL FOOTER:
     - Debe implementarse aparte (como componente o en un Layout), no puede ir "enterrado" 
       dentro de otros componentes de página.
     - Se debe usar la lógica dinámica para el año y las variables de Tailwind para el color.

  ==========================================================================
  FOOTER REFACTOREADO (Sugerencia):
  <footer className="bg-primary py-5 text-white text-[13px] font-medium flex justify-between px-10">
    <p>Copyright {new Date().getFullYear()}</p>
    <p>Contáctanos</p>
    <p>Ayuda</p>
  </footer>
  ==========================================================================
*/}




