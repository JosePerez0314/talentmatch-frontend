import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Context
import { AuthProvider, useAuth } from "./components/context/AuthContext";

// Layout
import Layout from "./layouts/Layout";

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
import CreateDepartment from "./pages/CreateDepartment"
import DepartmentHistory from "./pages/DepartmentHistory"


// --- PROTECTED ROUTE CORREGIDA ---
const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  // 1. ESPERA ACTIVA: Si el Contexto aún está leyendo el localStorage, no hacemos nada.
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F0F0F5]">
        <div className="animate-pulse text-gray-400 font-medium">Verificando sesión...</div>
      </div>
    );
  }

  // 2. VALIDACIÓN: Si terminó de cargar y realmente no hay usuario, al login.
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 3. ÉXITO: Si hay usuario, renderizamos el Layout con las rutas hijas (Outlet).
  return <Layout />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Ruta Pública */}
          <Route path="/login" element={<Login />} />

          {/* RUTAS PRIVADAS (Protegidas por el estado 'loading' y 'user') */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/position" element={<Position />} />
            <Route path="/uploadcv" element={<UploadCV />} />
            <Route path="/cv-history" element={<CVHistory />} />
            <Route path="/position-history" element={<PositionHistory />} />
            <Route path="/vacancy" element={<Vacancy />} />
            <Route path="/vacancy-history" element={<VacacyHistory />} />
            <Route path="/department" element={<CreateDepartment />} />
            <Route path="/department-history" element={<DepartmentHistory />} />
            <Route path="/resultados" element={<Resultados />} />
            <Route path="/resultados/:id" element={<Resultados />} />
          </Route>

          {/* Redirección por defecto para rutas inexistentes */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;