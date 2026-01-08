import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePropertyStats } from "../hooks/useProperties";
import { Users, PenTool, CheckCircle, Wallet } from "lucide-react";

interface PropertyOverviewTabProps {
    propertyId: string;
}

export function PropertyOverviewTab({ propertyId }: PropertyOverviewTabProps) {
    const { data: stats, isLoading } = usePropertyStats(propertyId);

    if (isLoading) {
        return <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-32 w-full rounded-xl bg-gray-100 animate-pulse" />
            <div className="h-32 w-full rounded-xl bg-gray-100 animate-pulse" />
            <div className="h-32 w-full rounded-xl bg-gray-100 animate-pulse" />
        </div>;
    }

    if (!stats) return <div>No hay datos disponibles.</div>;

    const occupancyColor = stats.occupancyRate >= 90 ? "text-green-600" : stats.occupancyRate >= 70 ? "text-yellow-600" : "text-red-600";
    const occupancyBg = stats.occupancyRate >= 90 ? "bg-green-100" : stats.occupancyRate >= 70 ? "bg-yellow-100" : "bg-red-100";
    const occupancyBarColor = stats.occupancyRate >= 90 ? "bg-green-600" : stats.occupancyRate >= 70 ? "bg-yellow-600" : "bg-red-600";

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Ocupación</CardTitle>
                        <Users size={16} className="text-gray-400" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${occupancyColor}`}>{stats.occupancyRate}%</div>
                        <p className="text-xs text-gray-500 mt-1">
                            {stats.occupiedUnits} de {stats.totalUnits} unidades ocupadas
                        </p>
                        <div className={`h-2 w-full mt-3 rounded-full ${occupancyBg}`}>
                            <div className={`h-full rounded-full ${occupancyBarColor}`} style={{ width: `${stats.occupancyRate}%` }}></div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Ingresos Proyectados</CardTitle>
                        <Wallet size={16} className="text-gray-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">
                            {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(stats.projectedRevenue)}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            Facturación mensual estimada
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Mantenimiento</CardTitle>
                        <PenTool size={16} className="text-gray-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">{stats.openMaintenanceTickets}</div>
                        <p className="text-xs text-gray-500 mt-1">
                            Tickets abiertos o en progreso
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Detailed Stats & Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Estado de Unidades</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="h-3 w-3 rounded-full bg-green-500"></div>
                                <span className="font-medium">Ocupadas</span>
                            </div>
                            <span className="font-bold text-gray-700">{stats.occupiedUnits}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="h-3 w-3 rounded-full bg-gray-300"></div>
                                <span className="font-medium">Vacantes</span>
                            </div>
                            <span className="font-bold text-gray-700">{stats.vacantUnits}</span>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex flex-col gap-4">
                    {/* Suggestion / Tip Card */}
                    <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-6">
                        <h4 className="font-bold text-indigo-900 flex items-center gap-2">
                            <CheckCircle size={18} className="text-indigo-600" />
                            Todo bajo control
                        </h4>
                        <p className="text-sm text-indigo-700 mt-2">
                            La propiedad tiene un desempeño del {stats.occupancyRate}% de ocupación.
                            {stats.occupancyRate < 100 && " Considera promocionar las unidades vacantes para maximizar ingresos."}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
