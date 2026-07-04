import React from "react";
import { BrowserRouter as Router, Routes, Route, Outlet, Navigate } from "react-router-dom";

// Context
import { AuthProvider, useAuth } from "./components/context/AuthContext";

// Components
import Sidebar from "./layouts/Sidebar";
import SessionTimeoutGuard from "./components/ui/SessionTimeoutGuard";

// Pages
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Position from "./pages/Position";
import UploadCV from "./pages/UploadCV";
import CVHistory from "./pages/CVHistory";
import PositionHistory from "./pages/PositionHistory";
import Vacancy from "./pages/Vacancy";
import VacacyHistory from "./pages/VacancyHistory";
import Resultados from "./pages/Resultados";
import CreateDepartment from "./pages/CreateDepartment";
import DepartmentHistory from "./pages/DepartmentHistory";
import CandidatesHistory from "./pages/CandidatesHistory";
import EvaluationsHistory from "./pages/EvaluationsHistory";
import AdvancedResults from "./pages/AdvancedResults";
import AdminPanel from "./pages/AdminPanel";

// Componente de Rutas Protegidas con Validación de Sesión Real activa
const ProtectedRoute: React.FC = () => {
  const { user, loading } = useAuth();

  // Pantalla de carga mientras se verifica el token/estado
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F0F0F5]">
        <div className="animate-pulse text-gray-400 font-medium">Verificando sesión...</div>
      </div>
    );
  }

  // Si no hay un usuario autenticado, rebota directo al login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen bg-[#F0F0F5] font-sans overflow-hidden text-left w-full">
      <SessionTimeoutGuard />
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-0 relative">
        <Outlet />
      </main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Redirección automática de la raíz al Login al iniciar */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Ruta Pública */}
          <Route path="/login" element={<Login />} />

          {/* RUTAS PRINCIPALES PROTEGIDAS */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/position" element={<Position />} />
            <Route path="/uploadcv" element={<UploadCV />} />
            <Route path="/cv-history" element={<CVHistory />} />
            <Route path="/position-history" element={<PositionHistory />} />

            {/* Rutas de Vacantes */}
            <Route path="/vacancy" element={<Vacancy />} />
            <Route path="/vacancy/edit/:id" element={<Vacancy />} />
            <Route path="/vacancy-history" element={<VacacyHistory />} />

            <Route path="/department" element={<CreateDepartment />} />
            <Route path="/department-history" element={<DepartmentHistory />} />
            <Route path="/resultados" element={<Resultados />} />
            <Route path="/resultados/:id" element={<Resultados />} />
            <Route path="/candidates-history" element={<CandidatesHistory />} />
            <Route path="/evaluations-history" element={<EvaluationsHistory />} />
            <Route path="/advanced-results/:id" element={<AdvancedResults />} />
            <Route path="/admin" element={<AdminPanel />} />
          </Route>

          {/* Cualquier ruta desconocida rebota al Dashboard (si está autenticado pasará, si no, ProtectedRoute lo mandará a login) */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;