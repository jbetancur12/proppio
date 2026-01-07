import { User, Phone, Mail, IdCard } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface RenterCardProps {
    renter: {
        id: string;
        firstName: string;
        lastName: string;
        email?: string;
        phone: string;
        identification: string;
    };
    onClick?: () => void;
}

/**
 * Presentational component - receives data via props, emits events
 * Following design_guidelines.md section 3.1
 */
export function RenterCard({ renter, onClick }: RenterCardProps) {
    return (
        <Card
            className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-gray-200"
            onClick={onClick}
        >
            <CardContent className="p-6">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-indigo-50 rounded-full text-indigo-600">
                        <User size={24} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-gray-900 truncate">
                            {renter.firstName} {renter.lastName}
                        </h3>
                        <div className="mt-3 space-y-2 text-sm text-gray-600">
                            {renter.email && (
                                <div className="flex items-center gap-2">
                                    <Mail size={14} className="shrink-0" />
                                    <span className="truncate">{renter.email}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-2">
                                <Phone size={14} className="shrink-0" />
                                <span>{renter.phone}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <IdCard size={14} className="shrink-0" />
                                <span>{renter.identification}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
