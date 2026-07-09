import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const AdminRoute: React.FC = () => {
    const { user } = useAuth();

    // 1. DEPURACIÓN: Esto te dirá en la consola del navegador qué está leyendo el sistema
    console.log("DEBUG AdminRoute - Usuario:", user);
    console.log("DEBUG AdminRoute - Rol detectado:", user?.role);

    // Si no hay usuario, manda al login
    if (!user) return <Navigate to="/login" replace />;

    // Verifica si el rol es exactamente 'admin' (puedes cambiarlo si tu DB usa otro valor)
    const isAdmin = user.role?.toLowerCase() === 'admin';

    if (!isAdmin) {
        console.warn("Acceso denegado: El usuario no tiene permisos de administrador.");
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
};