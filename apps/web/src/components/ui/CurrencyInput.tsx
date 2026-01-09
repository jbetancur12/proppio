
import * as React from "react";
import { Input } from "./input";
import { cn } from "@/lib/utils";

interface CurrencyInputProps extends Omit<React.ComponentProps<"input">, "onChange" | "value"> {
    value?: number;
    onChange?: (value: number) => void;
}

export const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
    ({ className, value, onChange, ...props }, ref) => {
        // Internal state to handle the input string (which might include incomplete state like "1.")
        const [displayValue, setDisplayValue] = React.useState("");

        // Update display value when prop value changes
        React.useEffect(() => {
            if (value === undefined || value === null) {
                setDisplayValue("");
                return;
            }
            // Only update from props if the prop value effectively matches the current parsed display value
            // This prevents cursor jumping or fighting with user input if the formatting is equivalent
            // However, for "1000", if prop changes to "2000" externally, we must update
            // We compare the numeric interpretation
            const numericDisplay = parseFloat(displayValue.replace(/\./g, ""));
            if (numericDisplay !== value) {
                setDisplayValue(new Intl.NumberFormat("es-CO", { maximumFractionDigits: 0 }).format(value));
            }
        }, [value]);

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            // Remove all non-numeric chars
            const rawValue = e.target.value.replace(/\D/g, "");

            if (rawValue === "") {
                setDisplayValue("");
                onChange?.(0); // Or handle null? Usually forms expect a number. Let's send 0 or allow undefined handling if needed? For now 0 or undefined.
                // If parent expects number, maybe 0.
                return;
            }

            const numberValue = parseInt(rawValue, 10);

            // Format simply with thousands separators
            const formatted = new Intl.NumberFormat("es-CO", { maximumFractionDigits: 0 }).format(numberValue);

            setDisplayValue(formatted);
            onChange?.(numberValue);
        };

        return (
            <Input
                type="text"
                inputMode="numeric"
                value={displayValue}
                onChange={handleChange}
                className={cn("", className)}
                ref={ref}
                {...props}
            />
        );
    }
);
CurrencyInput.displayName = "CurrencyInput";
