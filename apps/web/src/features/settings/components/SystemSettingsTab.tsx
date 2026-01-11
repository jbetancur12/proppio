import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { settingsApi } from "../services/settingsApi";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2, PlayCircle, RefreshCw, Wallet } from "lucide-react";

export function SystemSettingsTab() {
    const [loadingJob, setLoadingJob] = useState<string | null>(null);
    const [timezone, setTimezone] = useState<string>(() => localStorage.getItem('app_timezone') || 'America/Bogota');

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

                    <div className="mt-6 border-t pt-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Configuración Regional</h3>
                        <div className="flex items-center justify-between p-4 border rounded-lg bg-white">
                            <div>
                                <h3 className="font-medium text-gray-900">Zona Horaria</h3>
                                <p className="text-sm text-gray-500">Define la zona horaria para el registro y visualización de fechas.</p>
                            </div>
                            <div className="flex items-center space-x-2">
                                <select
                                    className="h-10 w-[200px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    value={timezone}
                                    onChange={async (e) => {
                                        const newTimezone = e.target.value;
                                        setTimezone(newTimezone); // Optimistic update
                                        try {
                                            await settingsApi.updateTenantConfig({ timezone: newTimezone });
                                            localStorage.setItem('app_timezone', newTimezone);
                                            toast.success("Zona horaria actualizada", {
                                                description: "Los cambios se aplicarán inmediatamente."
                                            });
                                        } catch (error) {
                                            console.error(error);
                                            toast.error("Error al actualizar", {
                                                description: "No se pudo guardar la zona horaria."
                                            });
                                            // Revert if failed (optional, but good UX)
                                            // setTimezone(prev => prev); 
                                        }
                                    }}
                                >
                                    <option value="America/Bogota">America/Bogota (UTC-5)</option>
                                    <option value="UTC">UTC (GMT+0)</option>
                                    <option value="America/New_York">America/New_York (UTC-5/EDT)</option>
                                    <option value="America/Mexico_City">America/Mexico_City (UTC-6)</option>
                                    <option value="Europe/Madrid">Europe/Madrid (CET)</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
