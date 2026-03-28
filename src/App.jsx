import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <Router>
      <Routes>
        {/* Ruta Login*/}
        <Route path="/login" element={<Login />} />

        {/* Ruta al Dashboard*/}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Redireccion por defecto */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;