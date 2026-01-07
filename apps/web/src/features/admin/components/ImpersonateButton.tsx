import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { UserCircle } from 'lucide-react';
import { useImpersonation } from '../hooks/useImpersonation';
import { api } from '@/api/client';

interface ImpersonateButtonProps {
    tenantId: string;
    tenantName: string;
}

export function ImpersonateButton({ tenantId, tenantName }: ImpersonateButtonProps) {
    const [showConfirm, setShowConfirm] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { startImpersonation } = useImpersonation();
    const navigate = useNavigate();

    const handleImpersonate = async () => {
        setIsLoading(true);

        try {
            // Set impersonation header globally
            api.defaults.headers.common['x-impersonate-tenant'] = tenantId;

            // Update state
            startImpersonation(tenantId, tenantName);

            // Redirect to regular dashboard
            navigate('/dashboard');

            // Reload to ensure all components pick up the new context
            window.location.reload();
        } catch (error) {
            console.error('Error impersonating:', error);
            alert('Error al impersonar tenant');
            setIsLoading(false);
        }
    };

    return (
        <>
            <Button
                onClick={() => setShowConfirm(true)}
                variant="outline"
                className="border-indigo-600 text-indigo-600 hover:bg-indigo-50"
            >
                <UserCircle className="mr-2 h-4 w-4" />
                Impersonate Tenant
            </Button>

            {showConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md">
                        <h3 className="text-lg font-semibold mb-2">Confirmar Impersonación</h3>
                        <p className="text-gray-600 mb-4">
                            ¿Deseas impersonar a <strong>{tenantName}</strong>?
                        </p>
                        <p className="text-sm text-amber-600 mb-6">
                            ⚠️ Podrás ver y modificar todo como si fueras este tenant. Esta acción quedará registrada en los logs de auditoría.
                        </p>
                        <div className="flex gap-3 justify-end">
                            <Button
                                variant="outline"
                                onClick={() => setShowConfirm(false)}
                                disabled={isLoading}
                            >
                                Cancelar
                            </Button>
                            <Button
                                onClick={handleImpersonate}
                                disabled={isLoading}
                                className="bg-indigo-600 hover:bg-indigo-700"
                            >
                                {isLoading ? 'Impersonando...' : 'Impersonate'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
