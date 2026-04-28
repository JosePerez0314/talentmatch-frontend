import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet} from "react-router-dom";

// Context
import { AuthProvider, useAuth} from "./components/context/AuthContext";

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
import Resultados from "./pages/Resultados"

// --- PROTECTED ROUTE ---
const ProtectedRoute = () => {
  const { user } = useAuth();
  
  // No token = return to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  //if everything is fine = continue Layout
  return <Layout />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Route */}
          <Route path="/login" element={<Login />} />

          {/* PRIVATE ROUTES */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/position" element={<Position />} />
            <Route path="/uploadcv" element={<UploadCV />} />
            <Route path="/cv-history" element={<CVHistory />} />
            <Route path="/position-history" element={<PositionHistory />} />
            <Route path="/vacancy" element={<Vacancy />} />
            <Route path="/vacancy-history" element={<VacacyHistory />} />
            <Route path="/resultados/:id" element={<Resultados />} />
          </Route>

          {/* Default Redirection */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;