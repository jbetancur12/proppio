import { useQuery } from "@tanstack/react-query";
import { settingsApi } from "../api/settingsApi";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertTriangle } from "lucide-react";

export function SubscriptionSettingsTab() {
    const { data: subscription, isLoading, error } = useQuery({
        queryKey: ['subscription'],
        queryFn: settingsApi.getSubscription,
    });

    if (isLoading) {
        return <div className="p-4">Cargando información de suscripción...</div>;
    }

    if (error) {
        return <div className="p-4 text-red-500">Error al cargar la suscripción.</div>;
    }

    const isActive = subscription?.status === 'ACTIVE';

    return (
        <div className="space-y-6">
            <Card className="border-indigo-100 overflow-hidden">
                <div className="bg-indigo-600 h-2 w-full"></div>
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="text-xl">Plan actual: {subscription?.plan || 'N/A'}</CardTitle>
                            <CardDescription>Detalles de tu licencia Proppio</CardDescription>
                        </div>
                        <Badge variant={isActive ? "default" : "destructive"} className={isActive ? "bg-green-600" : ""}>
                            {isActive ? "ACTIVO" : "SUSPENDIDO"}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h4 className="text-sm font-medium text-gray-500 mb-2">Estado de la cuenta</h4>
                            <div className="flex items-center gap-2 text-gray-900">
                                {isActive ? (
                                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                                ) : (
                                    <AlertTriangle className="h-5 w-5 text-red-500" />
                                )}
                                <span className="font-medium">
                                    {isActive ? "Tu cuenta está al día" : "Atención requerida"}
                                </span>
                            </div>
                        </div>

                        {subscription?.renewalDate && (
                            <div>
                                <h4 className="text-sm font-medium text-gray-500 mb-2">Próxima renovación</h4>
                                <p className="font-medium">{new Date(subscription.renewalDate).toLocaleDateString()}</p>
                            </div>
                        )}

                    </div>

                    <div className="pt-4 border-t border-gray-100 flex gap-4">
                        <Button variant="outline" onClick={() => window.open('mailto:soporte@proppio.co')}>
                            Contactar Soporte
                        </Button>
                        {/* <Button variant="default">Gestionar Pagos</Button> */}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
