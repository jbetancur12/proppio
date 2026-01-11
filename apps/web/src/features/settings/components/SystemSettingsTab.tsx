import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { settingsApi } from "../services/settingsApi";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2, PlayCircle, RefreshCw, Wallet } from "lucide-react";

export function SystemSettingsTab() {
    const [loadingJob, setLoadingJob] = useState<string | null>(null);

    const handleRunCron = async (jobName: 'all' | 'pending-payments' | 'lease-renewals', label: string) => {
        setLoadingJob(jobName);
        try {
            await settingsApi.runCronJob(jobName);
            toast.success("Ejecución Exitosa", {
                description: `La tarea "${label}" se ha ejecutado correctamente.`
            });
        } catch (error) {
            console.error(error);
            toast.error("Error", {
                description: "No se pudo ejecutar la tarea. Revisa los logs o intenta más tarde."
            });
        } finally {
            setLoadingJob(null);
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Operaciones del Sistema</CardTitle>
                    <CardDescription>
                        Ejecuta manualmente tareas de mantenimiento y generación de datos.
                        Estas acciones solo afectan a tu cuenta/tenant.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg bg-white">
                            <div className="flex items-center space-x-4">
                                <div className="p-2 bg-indigo-50 rounded-full text-indigo-600">
                                    <Wallet size={24} />
                                </div>
                                <div>
                                    <h3 className="font-medium text-gray-900">Generar Pagos Pendientes</h3>
                                    <p className="text-sm text-gray-500">Procesa contratos activos y genera cuotas vencidas.</p>
                                </div>
                            </div>
                            <Button
                                variant="outline"
                                disabled={!!loadingJob}
                                onClick={() => handleRunCron('pending-payments', 'Generar Pagos')}
                            >
                                {loadingJob === 'pending-payments' ? <Loader2 className="animate-spin mr-2" size={16} /> : <PlayCircle className="mr-2" size={16} />}
                                Ejecutar
                            </Button>
                        </div>

                        <div className="flex items-center justify-between p-4 border rounded-lg bg-white">
                            <div className="flex items-center space-x-4">
                                <div className="p-2 bg-indigo-50 rounded-full text-indigo-600">
                                    <RefreshCw size={24} />
                                </div>
                                <div>
                                    <h3 className="font-medium text-gray-900">Renovar Contratos</h3>
                                    <p className="text-sm text-gray-500">Busca contratos vencidos configurados para renovación automática.</p>
                                </div>
                            </div>
                            <Button
                                variant="outline"
                                disabled={!!loadingJob}
                                onClick={() => handleRunCron('lease-renewals', 'Renovar Contratos')}
                            >
                                {loadingJob === 'lease-renewals' ? <Loader2 className="animate-spin mr-2" size={16} /> : <PlayCircle className="mr-2" size={16} />}
                                Ejecutar
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
