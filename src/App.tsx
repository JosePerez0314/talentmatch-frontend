import React from "react";
import { BrowserRouter as Router, Routes, Route, Outlet } from "react-router-dom";

// Context
import { AuthProvider } from "./components/context/AuthContext";

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

// Se han retirado los bloqueos de sesion temporalmente para facilitar pruebas
const ProtectedRoute: React.FC = () => {
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
          {/* Ruta Pública */}
          <Route path="/login" element={<Login />} />

          {/* RUTAS PRINCIPALES  */}
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
            <Route path="/candidates-history" element={<CandidatesHistory />} />
            <Route path="/evaluations-history" element={<EvaluationsHistory />} />
            <Route path="/advanced-results/:id" element={<AdvancedResults />} />
            <Route path="/admin" element={<AdminPanel />} />
          </Route>
          
          {/* Se eliminó la ruta por defecto ('*') temporalmente */}
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;