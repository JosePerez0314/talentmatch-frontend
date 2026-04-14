import React, { useState } from "react";
import AuthInput from "./AuthInput";

// Assets
import { Icons } from "../../assets/icons";

const LoginForm = ({ inputs, onChange, onSubmit, uiState }) => {
  // Local state to show/hide password
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="w-full max-w-[420px] bg-white rounded-[24px] p-10 shadow-sm border border-blue-50 animate-fade-in">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold">Inicia Sesión</h1>
        <p className="text-[#447ECA] font-medium mt-2">TalentMatch AI</p>
      </div>

      {/* Error Message */}
      {uiState === "error" && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-semibold text-center animate-fade-in">
          Credenciales incorrectas.
        </div>
      )}

      <form onSubmit={onSubmit} className="flex flex-col gap-5">
        <AuthInput
          label="Usuario"
          name="email"
          type="email"
          placeholder="Correo Electrónico"
          icon={Icons.auth.mail}
          value={inputs.email}
          onChange={onChange}
          required
        />

        <div className="relative">
          <AuthInput
            label="Contraseña"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Contraseña"
            icon={Icons.auth.lock}
            value={inputs.password}
            onChange={onChange}
            required
          />
          {/* Buttom eye*/}
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-[42px] opacity-40 hover:opacity-100 transition-opacity"
          >
            <img 
              src={showPassword ? Icons.auth.eyeOpen : Icons.auth.eyeClosed} 
              alt="Mostrar" 
              className="w-5 h-5" 
            />
          </button>
        </div>

        {/* Button automatically disabled while uiState is 'loading' */}
        <button
          type="submit"
          disabled={uiState === "loading"}
          className="w-full py-4 mt-2 bg-[#447ECA] text-white font-bold rounded-full hover:bg-[#3669ab] transition-all active:scale-[0.98] disabled:opacity-50"
        >
          {uiState === "loading" ? "Cargando..." : "Inicia sesión"}
        </button>
      </form>
    </div>
  );
};

export default LoginForm;