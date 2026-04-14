import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Context
import { AuthProvider } from "./components/context/AuthContext";

// Layout
import Layout from "./layouts/Layout";

// Pages
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Position from "./pages/Position";
import UploadCV from "./pages/UploadCV";
import CVHistory from "./pages/CVHistory";
import PositionHistory from "./pages/PositionHistory";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Route */}
          <Route path="/login" element={<Login />} />

          {/* PRIVATE ROUTES - Optimizadas con Layout como contenedor */}
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/position" element={<Position />} />
            <Route path="/uploadcv" element={<UploadCV />} />
            <Route path="/cv-history" element={<CVHistory />} />
            <Route path="/position-history" element={<PositionHistory />} />
          </Route>

          {/* Default Redirection */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;