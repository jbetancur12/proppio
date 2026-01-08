import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export function RequireSuperAdmin({ children }: { children: ReactNode }) {
    const { user, isAuthenticated } = useAuth();
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (user?.globalRole !== 'SUPER_ADMIN') {
        // Redirect unauthorized users to dashboard
        return <Navigate to="/dashboard" replace />;
    }

    return children;
}
