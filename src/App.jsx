import { BrowserRouter as Router, Routes, Route, Navigate,} from "react-router-dom";

//Pages
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Position from "./pages/Position";
import UploadCV from "./pages/UploadCV";

//Layout
import Layout from "./layouts/Layout";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public route */}
        <Route path="/login" element={<Login />} />

        {/* PRIVATE ROUTES (WITH LAYOUT) */}
        <Route path="/dashboard" element={<Layout> <Dashboard /> </Layout>} />

        <Route path="/position" element={<Layout> <Position /> </Layout>} />

        <Route path="/uploadcv" element={<Layout> <UploadCV /> </Layout>} />

        {/* DEFAULT REDIRECTION */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
