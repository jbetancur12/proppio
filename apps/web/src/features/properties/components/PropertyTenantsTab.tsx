import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUnits } from "../hooks/useProperties";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Mail, Phone, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface PropertyTenantsTabProps {
    propertyId: string;
}

export function PropertyTenantsTab({ propertyId }: PropertyTenantsTabProps) {
    // We use useUnits which calls getUnits, which in turn calls UnitsService.findAllByProperty
    // So the data will now include the enhanced activeLease info.
    const { data: units, isLoading } = useUnits(propertyId);
    const navigate = useNavigate();

    // Filter units that have active leases, or show empty state if none.
    const unitsWithTenants = units?.filter((u: any) => u.activeLease) || [];

    if (isLoading) {
        return <div className="space-y-4">
            <div className="h-12 w-full bg-gray-100 animate-pulse rounded-md" />
            <div className="h-12 w-full bg-gray-100 animate-pulse rounded-md" />
            <div className="h-12 w-full bg-gray-100 animate-pulse rounded-md" />
        </div>;
    }

    if (unitsWithTenants.length === 0) {
        return (
            <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed">
                <p className="text-gray-500 mb-4">No hay inquilinos activos actualmente.</p>
                <p className="text-sm text-gray-400">Las unidades ocupadas aparecerán aquí.</p>
            </div>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Inquilinos Activos</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="relative w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm">
                        <thead className="[&_tr]:border-b">
                            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">Unidad</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">Inquilino</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">Contacto</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">Contrato</th>
                                <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">Canon</th>
                                <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0"></th>
                            </tr>
                        </thead>
                        <tbody className="[&_tr:last-child]:border-0">
                            {unitsWithTenants.map((unit: any) => (
                                <tr key={unit.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                    <td className="p-4 align-middle font-medium">{unit.name}</td>
                                    <td className="p-4 align-middle">
                                        <div className="flex flex-col">
                                            <span className="font-medium">{unit.activeLease.renterName}</span>
                                            <span className="text-xs text-gray-500">ID: {unit.activeLease.renterId.slice(0, 8)}...</span>
                                        </div>
                                    </td>
                                    <td className="p-4 align-middle">
                                        <div className="flex flex-col gap-1 text-sm text-gray-600">
                                            {unit.activeLease.email && (
                                                <div className="flex items-center gap-2">
                                                    <Mail size={14} />
                                                    <span className="truncate max-w-[150px]" title={unit.activeLease.email}>{unit.activeLease.email}</span>
                                                </div>
                                            )}
                                            {unit.activeLease.phone && (
                                                <div className="flex items-center gap-2">
                                                    <Phone size={14} />
                                                    <span>{unit.activeLease.phone}</span>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4 align-middle">
                                        <div className="flex flex-col text-sm">
                                            <span className="text-gray-500">Fin: {format(new Date(unit.activeLease.endDate), "d MMM yyyy", { locale: es })}</span>
                                            <Badge variant="outline" className="w-fit mt-1 bg-green-50 text-green-700 border-green-200">Activo</Badge>
                                        </div>
                                    </td>
                                    <td className="p-4 align-middle text-right font-medium">
                                        {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(unit.activeLease.monthlyRent)}
                                    </td>
                                    <td className="p-4 align-middle text-right">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => navigate(`/leases/${unit.activeLease.id}`)}
                                            title="Ver Contrato"
                                        >
                                            <ExternalLink size={16} />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
}
