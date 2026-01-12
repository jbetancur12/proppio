import { Building, MapPin, Wallet, Clock } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { memo } from "react";

interface PropertyCardProps {
    property: {
        id: string;
        name: string;
        address: string;
        units?: unknown[];
        alerts?: string[];
        occupancyRate?: number;
    };
    onClick?: () => void;
}

/**
 * Presentational component - receives data via props
 * Following design_guidelines.md section 3.1
 * Memoized to prevent unnecessary re-renders
 */
export const PropertyCard = memo(function PropertyCard({ property, onClick }: PropertyCardProps) {
    const hasPendingPayments = property.alerts?.includes('PENDING_PAYMENTS');
    const hasExpiringLease = property.alerts?.includes('EXPIRING_LEASE');
    const occupancy = property.occupancyRate ?? 0;

    return (
        <Card
            className="group hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden border-gray-200"
            onClick={onClick}
        >
            <div className="h-40 bg-gray-100 relative group-hover:scale-105 transition-transform duration-500">
                <div className="absolute inset-0 bg-gradient-to-tr from-gray-200 to-gray-100 flex items-center justify-center text-gray-300">
                    <Building size={48} />
                </div>

                {/* Unit Count Badge */}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-2 py-1 rounded-md text-xs font-bold shadow-sm">
                    {property.units?.length || 0} Unidades
                </div>

                {/* Alerts Section */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                    {hasPendingPayments && (
                        <div className="bg-red-100 text-red-700 px-2 py-1 rounded-md text-xs font-bold shadow-sm flex items-center gap-1 border border-red-200 animate-in fade-in zoom-in">
                            <Wallet size={12} /> Pagos
                        </div>
                    )}
                    {hasExpiringLease && (
                        <div className="bg-amber-100 text-amber-700 px-2 py-1 rounded-md text-xs font-bold shadow-sm flex items-center gap-1 border border-amber-200 animate-in fade-in zoom-in">
                            <Clock size={12} /> Vence pronto
                        </div>
                    )}
                </div>
            </div>
            <CardContent className="p-5">
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                    {property.name}
                </h3>
                <div className="flex items-start gap-2 mt-2 text-gray-500 text-sm">
                    <MapPin size={16} className="mt-0.5 shrink-0" />
                    {property.address}
                </div>
            </CardContent>
            <CardFooter className="p-5 pt-0 flex justify-between items-center text-sm text-gray-500 border-t border-gray-50 mt-4 pt-4">
                <span>Ocupación</span>
                <span className={`font-medium ${occupancy === 100 ? 'text-green-600' : 'text-gray-900'}`}>
                    {occupancy}%
                </span>
            </CardFooter>
        </Card>
    );
});
