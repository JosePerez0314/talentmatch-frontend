import React from "react";

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
// 1. Importa el proveedor del contexto (ajusta la ruta si es necesario)
import { AuthProvider } from "./context/AuthContext";

// Pages
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Position from "./pages/Position";
import UploadCV from "./pages/UploadCV";
import CVHistory from "./pages/CVHistory";

// Layout
import Layout from "./layouts/Layout";

function App() {
  return (
    // 2. Envuelve todo con el AuthProvider
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public route */}
          <Route path="/login" element={<Login />} />

          {/* PRIVATE ROUTES (WITH LAYOUT) */}
          <Route
            path="/dashboard"
            element={
              <Layout>
                {" "}
                <Dashboard />{" "}
              </Layout>
            }
          />
          <Route
            path="/position"
            element={
              <Layout>
                {" "}
                <Position />{" "}
              </Layout>
            }
          />
          <Route
            path="/uploadcv"
            element={
              <Layout>
                {" "}
                <UploadCV />{" "}
              </Layout>
            }
          />
          <Route
            path="/cv-history"
            element={
              <Layout>
                {" "}
                <CVHistory />{" "}
              </Layout>
            }
          />

          {/* DEFAULT REDIRECTION */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
