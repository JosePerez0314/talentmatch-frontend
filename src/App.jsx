import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./features/Login";
import Dashboard from "./features/Dashboard";
import Position from "./features/Position";

function App() {
  return (
    <Router>
      <Routes>
        {/* Ruta Login*/}
        <Route path="/login" element={<Login />} />

        {/* Ruta al Dashboard*/}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Ruta Position*/}
        <Route path="/position" element={<Position />} />

        {/* Redireccion por defecto */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
