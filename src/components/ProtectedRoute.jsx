import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowRoles }) => {
    const { user, loading } = useAuth();

    // Tahan proses redirect jika AuthContext masih memuat data dari localStorage
    if (loading) {
        return (
            <div className="h-screen w-screen bg-slate-900 flex flex-col items-center justify-center text-white">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-xs font-bold tracking-[0.2em] uppercase text-slate-500">Sinkronisasi Sesi...</p>
            </div>
        );
    }

    // Jika loading selesai dan user tetap null, baru pindah ke login
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Pengecekan Role
    if (allowRoles && !allowRoles.includes(user.role)) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

export default ProtectedRoute;