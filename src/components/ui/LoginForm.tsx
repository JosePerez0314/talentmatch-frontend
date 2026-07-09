import React, { useState } from "react";

import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import AuthInput from "./AuthInput";
import { AuthUiState, LoginCredentials } from "../../types/auth.types";

interface LoginFormProps {
  inputs: LoginCredentials;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  /** Login swaps this form for a spinner while loading, so that state never reaches here. */
  uiState: Exclude<AuthUiState, "loading">;
  errorMessage: string;
}

const LoginForm: React.FC<LoginFormProps> = ({
  inputs,
  onChange,
  onSubmit,
  uiState,
  errorMessage,
}) => {
  const [showPassword, setShowPassword] = useState<boolean>(false);

  return (
    <div className="w-full max-w-[420px] bg-white rounded-[24px] p-10 shadow-sm border border-blue-50 animate-fade-in">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold">Inicia Sesión</h1>
        <p className="text-[#447ECA] font-medium mt-2">TalentMatch AI</p>
      </div>

      {uiState === "error" && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-semibold text-center animate-fade-in">
          {errorMessage}
        </div>
      )}

      <form onSubmit={onSubmit} className="flex flex-col gap-5">
        <AuthInput
          label="Usuario"
          name="email"
          type="email"
          placeholder="Correo Electrónico"
          icon={<Mail className="w-5 h-5 text-gray-400" />}
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
            icon={<Lock className="w-5 h-5 text-gray-400" />}
            value={inputs.password}
            onChange={onChange}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-[42px] text-gray-400 hover:text-gray-600 transition-colors"
          >
            {showPassword ? (
              <Eye className="w-5 h-5" />
            ) : (
              <EyeOff className="w-5 h-5" />
            )}
          </button>
        </div>

        <button
          type="submit"
          className="w-full py-4 mt-2 bg-[#447ECA] text-white font-bold rounded-full hover:bg-[#3669ab] transition-all active:scale-[0.98]"
        >
          Inicia sesión
        </button>
      </form>
    </div>
  );
};

export default LoginForm;
