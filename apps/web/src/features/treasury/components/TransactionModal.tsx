import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { treasuryApi } from '../services/treasuryApi';
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { Controller } from 'react-hook-form';

const transactionSchema = z.object({
    date: z.string().min(1, "Fecha requerida"),
    amount: z.coerce.number().min(1, "Monto requerido"),
    type: z.enum(['INCOME', 'EXPENSE']),
    category: z.string().min(1, "Categoría requerida"),
    description: z.string().min(3, "Descripción mínima de 3 caracteres"),
    reference: z.string().optional()
});

type TransactionForm = z.infer<typeof transactionSchema>;

interface TransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const CATEGORIES = {
    INCOME: [
        { value: 'INVESTMENT', label: 'Inversión / Aporte' },
        { value: 'LOAN', label: 'Préstamo Recibido' },
        { value: 'REFUND', label: 'Reembolso' },
        { value: 'OTHER_INCOME', label: 'Otro Ingreso' }
    ],
    EXPENSE: [
        { value: 'SALARY', label: 'Nómina' },
        { value: 'TAXES', label: 'Impuestos' },
        { value: 'SERVICES', label: 'Servicios (Oficina)' },
        { value: 'MARKETING', label: 'Publicidad' },
        { value: 'LEGAL', label: 'Gastos Legales' },
        { value: 'OFFICE', label: 'Gastos de Oficina' },
        { value: 'WITHDRAWAL', label: 'Retiro de Utilidades' },
        { value: 'OTHER_EXPENSE', label: 'Otro Gasto' }
    ]
};

export function TransactionModal({ isOpen, onClose, onSuccess }: TransactionModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const { register, handleSubmit, watch, setValue, formState: { errors }, reset, control } = useForm<TransactionForm>({
        // @ts-ignore
        resolver: zodResolver(transactionSchema),
        defaultValues: {
            type: 'EXPENSE',
            date: new Date().toISOString().split('T')[0]
        }
    });

    const selectedType = watch('type');

    const onSubmit = async (data: TransactionForm) => {
        setIsLoading(true);
        try {
            await treasuryApi.createTransaction({
                ...data,
                date: data.date, // API expects ISO string, but simple date string YYYY-MM-DD works if parsing on backend
            } as any);
            toast.success('Movimiento registrado');
            reset();
            onSuccess();
            onClose();
        } catch (error) {
            console.error(error);
            toast.error('Error al registrar movimiento');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Registrar Movimiento de Tesorería</DialogTitle>
                </DialogHeader>
                {/* @ts-ignore */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Tipo</Label>
                            <Select
                                onValueChange={(v) => setValue('type', v as 'INCOME' | 'EXPENSE')}
                                defaultValue="EXPENSE"
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccione tipo" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="INCOME">Ingreso (+)</SelectItem>
                                    <SelectItem value="EXPENSE">Egreso (-)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Fecha</Label>
                            <Input type="date" {...register('date')} />
                            {errors.date && <p className="text-sm text-red-500">{errors.date.message}</p>}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Concepto / Categoría</Label>
                        <Select onValueChange={(v) => setValue('category', v)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccione categoría" />
                            </SelectTrigger>
                            <SelectContent>
                                {CATEGORIES[selectedType].map(cat => (
                                    <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.category && <p className="text-sm text-red-500">{errors.category.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label>Monto</Label>
                        <Controller
                            name="amount"
                            control={control}
                            render={({ field: { onChange, value } }) => (
                                <CurrencyInput
                                    value={value}
                                    onChange={onChange}
                                    placeholder="0"
                                />
                            )}
                        />
                        {errors.amount && <p className="text-sm text-red-500">{errors.amount.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label>Descripción</Label>
                        <Textarea placeholder="Detalles del movimiento..." {...register('description')} />
                        {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label>Referencia (Opcional)</Label>
                        <Input placeholder="# Factura, Recibo..." {...register('reference')} />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? 'Guardando...' : 'Guardar'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
