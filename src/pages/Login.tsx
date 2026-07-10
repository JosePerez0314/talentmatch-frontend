import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";

import Footer from "../layouts/Footer";
import LoginForm from "../components/ui/LoginForm";
import { useAuth } from "../components/context/AuthContext";
import { authService } from "../services/api/auth.api";
import { ApiError } from "../services/api/apiClient";
import { AuthUiState, LoginCredentials } from "../types/auth.types";
import { UserRole } from "../types/api.types";
import { Icons } from "../assets/icons/index";
import { resolveLoginEmail } from "../utils/loginShortcuts";

interface LocationState {
  sessionExpired?: boolean;
}

const INVALID_CREDENTIALS_MESSAGE = "Credenciales incorrectas.";
const SERVER_ERROR_MESSAGE =
  "No pudimos contactar con el servidor. Inténtalo de nuevo.";

/** Anything the API returns that isn't the ADMIN enum value is a regular USER. */
const asRole = (role: string | undefined): UserRole =>
  role === "ADMIN" ? "ADMIN" : "USER";

/** Only a 400/401 means the credentials were wrong; anything else is our fault, not the user's. */
const resolveErrorMessage = (error: unknown): string => {
  if (error instanceof ApiError && (error.status === 400 || error.status === 401)) {
    return INVALID_CREDENTIALS_MESSAGE;
  }
  return SERVER_ERROR_MESSAGE;
};

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const location = useLocation();

  const [inputs, setInputs] = useState<LoginCredentials>({
    email: "",
    password: "",
  });
  const [uiState, setUiState] = useState<AuthUiState>("form");
  const [errorMessage, setErrorMessage] = useState<string>(
    INVALID_CREDENTIALS_MESSAGE,
  );

  const state = location.state as LocationState | null;
  const timeoutMessage = state?.sessionExpired
    ? "Tu sesión ha sido cerrada por inactividad por motivos de seguridad."
    : null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setInputs((prev) => ({ ...prev, [name]: value }));
    if (uiState === "error") setUiState("form");
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    e.preventDefault();
    setUiState("loading");

    try {
      const credentials: LoginCredentials = {
        ...inputs,
        email: resolveLoginEmail(inputs.email),
      };
      const { token, user } = await authService.login(credentials);

      if (!token) throw new Error("El servidor no devolvió un token de acceso.");

      const role = asRole(user?.role);
      const email = user?.email || inputs.email;

      login({ email, token, role });
      navigate(role === "ADMIN" ? "/admin" : "/dashboard");
    } catch (error) {
      console.error("Fallo de Autenticación:", error);
      setErrorMessage(resolveErrorMessage(error));
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
        {timeoutMessage && (
          <div className="mb-6 max-w-md w-full bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl shadow-sm">
            <p className="text-red-700 text-sm font-bold">{timeoutMessage}</p>
          </div>
        )}

        {uiState === "loading" ? (
          <div className="flex flex-col items-center justify-center gap-6 animate-pulse">
            <p className="text-xl font-medium text-gray-700 font-sans">
              Verificando...
            </p>
            <Loader2 className="h-16 w-16 animate-spin text-[#447ECA] opacity-80" />
          </div>
        ) : (
          <div className="w-full max-w-md flex flex-col items-center">
            <LoginForm
              inputs={inputs}
              onChange={handleInputChange}
              onSubmit={handleSubmit}
              uiState={uiState}
              errorMessage={errorMessage}
            />
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Login;
