import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Position from "./pages/Position";
import UploadCV from "./pages/UploadCV";
import Layout from "./layouts/Layout";

function App() {
  return (
    <Router>
      <Routes>
        {/* Ruta Login*/}
        <Route path="/login" element={<Layout> <Login /> </Layout>} />   {/*QUitar el Layout del login, dejado por mientras*/}

        {/* Ruta al Dashboard*/}
        <Route path="/dashboard" element={<Layout> <Dashboard /> </Layout>} />

        {/* Ruta Position*/}
        <Route path="/position" element={<Layout> <Position /> </Layout>} />

        {/* Ruta al Dashboard*/}
        <Route path="/uploadcv" element={<Layout> <UploadCV /> </Layout>} />

        {/* Redireccion por defecto */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
