import { Building, MapPin } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

interface PropertyCardProps {
    property: {
        id: string;
        name: string;
        address: string;
        units?: unknown[];
    };
    onClick?: () => void;
}

/**
 * Presentational component - receives data via props
 * Following design_guidelines.md section 3.1
 */
export function PropertyCard({ property, onClick }: PropertyCardProps) {
    return (
        <Card
            className="group hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden border-gray-200"
            onClick={onClick}
        >
            <div className="h-40 bg-gray-100 relative group-hover:scale-105 transition-transform duration-500">
                <div className="absolute inset-0 bg-gradient-to-tr from-gray-200 to-gray-100 flex items-center justify-center text-gray-300">
                    <Building size={48} />
                </div>
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-2 py-1 rounded-md text-xs font-bold shadow-sm">
                    {property.units?.length || 0} Unidades
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
                <span className="font-medium text-gray-900">--%</span>
            </CardFooter>
        </Card>
    );
}
