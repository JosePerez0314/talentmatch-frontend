import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const AdminRoute: React.FC = () => {
    const { user } = useAuth();

    // Si no hay usuario, manda al login
    if (!user) return <Navigate to="/login" replace />;

    // `SessionUser.role` is already normalized to lowercase by Login.tsx.
    if (user.role !== 'admin') return <Navigate to="/dashboard" replace />;

    return <Outlet />;
};