import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogOut, AlertCircle } from 'lucide-react';
import { useImpersonation } from '../hooks/useImpersonation';
import { api } from '@/api/client';

export function ExitImpersonationBanner() {
    const { isImpersonating, impersonatedTenantName, endImpersonation } = useImpersonation();
    const navigate = useNavigate();

    if (!isImpersonating) return null;

    const handleExit = () => {
        // Remove impersonation header
        delete api.defaults.headers.common['x-impersonate-tenant'];

        // Update state
        endImpersonation();

        // Redirect to admin panel
        navigate('/admin');

        // Reload to clear tenant context
        window.location.reload();
    };

    return (
        <div className="fixed top-0 left-0 right-0 bg-amber-500 text-white px-4 py-3 z-50 shadow-lg">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <AlertCircle className="h-5 w-5" />
                    <span className="font-medium">
                        Estás impersonando a: <strong>{impersonatedTenantName}</strong>
                    </span>
                </div>
                <Button
                    onClick={handleExit}
                    variant="outline"
                    size="sm"
                    className="bg-white text-amber-700 hover:bg-amber-50 border-amber-600"
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    Salir de Impersonación
                </Button>
            </div>
        </div>
    );
}
