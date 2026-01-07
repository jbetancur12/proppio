import { Wrench, Zap, Hammer, FileText, Shield, HelpCircle, DollarSign } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ExpenseData } from "../services/expensesApi";

interface ExpenseCardProps {
    expense: ExpenseData;
}

const categoryConfig: Record<string, { label: string; icon: any; color: string }> = {
    MAINTENANCE: { label: 'Mantenimiento', icon: Wrench, color: 'text-blue-600 bg-blue-50' },
    REPAIRS: { label: 'Reparación', icon: Hammer, color: 'text-orange-600 bg-orange-50' },
    UTILITIES: { label: 'Servicios', icon: Zap, color: 'text-yellow-600 bg-yellow-50' },
    TAXES: { label: 'Impuestos', icon: FileText, color: 'text-purple-600 bg-purple-50' },
    MANAGEMENT: { label: 'Administración', icon: DollarSign, color: 'text-green-600 bg-green-50' },
    INSURANCE: { label: 'Seguros', icon: Shield, color: 'text-indigo-600 bg-indigo-50' },
    OTHER: { label: 'Otro', icon: HelpCircle, color: 'text-gray-600 bg-gray-50' },
};

export function ExpenseCard({ expense }: ExpenseCardProps) {
    const config = categoryConfig[expense.category] || categoryConfig.OTHER;
    const CategoryIcon = config.icon;

    const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('es-CO');
    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(amount);

    return (
        <Card className="hover:shadow-md transition-all duration-300 border-gray-200">
            <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className={cn("p-2 rounded-lg", config.color)}>
                        <CategoryIcon size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900">{expense.description}</h3>
                        <p className="text-xs text-gray-500">
                            {expense.property.name} {expense.unit ? `• ${expense.unit.name}` : ''}
                            {expense.supplier ? ` • ${expense.supplier}` : ''}
                        </p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="font-bold text-red-600">-{formatCurrency(expense.amount)}</p>
                    <p className="text-xs text-gray-400">{formatDate(expense.date)}</p>
                </div>
            </CardContent>
        </Card>
    );
}
