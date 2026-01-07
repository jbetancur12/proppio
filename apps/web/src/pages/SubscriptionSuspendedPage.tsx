import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Mail, Phone } from 'lucide-react';

export function SubscriptionSuspendedPage() {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
            <Card className="max-w-md w-full shadow-lg border-amber-200">
                <CardHeader className="text-center pb-4">
                    <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                        <AlertTriangle className="text-amber-600" size={32} />
                    </div>
                    <CardTitle className="text-2xl font-bold text-gray-900">
                        Suscripción Suspendida
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-gray-600 text-center">
                        Tu suscripción ha sido suspendida. Para continuar usando Rent Manager,
                        por favor contacta a nuestro equipo de soporte.
                    </p>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                        <h3 className="font-semibold text-blue-900 text-sm">
                            Información de Contacto
                        </h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2 text-blue-700">
                                <Mail size={16} />
                                <a href="mailto:soporte@rentmanager.com" className="hover:underline">
                                    soporte@rentmanager.com
                                </a>
                            </div>
                            <div className="flex items-center gap-2 text-blue-700">
                                <Phone size={16} />
                                <span>+57 300 123 4567</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
                        <p className="font-medium text-gray-900 mb-2">
                            ¿Por qué fue suspendida mi cuenta?
                        </p>
                        <ul className="list-disc list-inside space-y-1 text-xs">
                            <li>Pago pendiente o vencido</li>
                            <li>Problemas con el método de pago</li>
                            <li>Actualización de plan requerida</li>
                        </ul>
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-2">
                    <Button
                        className="w-full bg-indigo-600 hover:bg-indigo-700"
                        onClick={() => window.location.href = 'mailto:soporte@rentmanager.com'}
                    >
                        <Mail className="mr-2" size={18} />
                        Contactar Soporte
                    </Button>
                    <Button
                        variant="outline"
                        className="w-full"
                        onClick={handleLogout}
                    >
                        Cerrar Sesión
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
