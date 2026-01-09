import { ReactNode } from 'react';
import { Label } from '../ui/label';
import { cn } from '@/lib/utils';

interface FormFieldProps {
    label: string;
    error?: string;
    required?: boolean;
    children: ReactNode;
    className?: string;
}

export function FormField({ label, error, required, children, className }: FormFieldProps) {
    return (
        <div className={cn("space-y-2", className)}>
            <Label className="text-sm font-medium">
                {label}
                {required && <span className="text-destructive ml-1">*</span>}
            </Label>
            {children}
            {error && (
                <p className="text-sm text-destructive font-medium">{error}</p>
            )}
        </div>
    );
}
