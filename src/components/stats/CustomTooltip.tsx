import { format, parseISO } from "date-fns";
import { it } from "date-fns/locale";
import { formatCurrency } from "@/lib/utils";

interface CustomTooltipProps {
    active?: boolean;
    payload?: any[];
    label?: string;
    valuePrefix?: string;
    isCurrency?: boolean;
}

export function CustomTooltip({ active, payload, label, valuePrefix = "", isCurrency = false }: CustomTooltipProps) {
    if (active && payload && payload.length) {
        return (
            <div className="bg-card/95 backdrop-blur-md border border-border p-3 rounded-xl shadow-xl ring-1 ring-black/5 min-w-[150px]">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">
                    {label ? (
                        format(parseISO(label), "eeee d MMMM yyyy", { locale: it })
                            .charAt(0).toUpperCase() + format(parseISO(label), "eeee d MMMM yyyy", { locale: it }).slice(1)
                    ) : ""}
                </p>
                <div className="space-y-1.5">
                    {payload.map((item, index) => (
                        <div key={index} className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                                <div 
                                    className="w-2.5 h-2.5 rounded-full ring-1 ring-black/5" 
                                    style={{ backgroundColor: item.color || item.fill || 'var(--primary)' }} 
                                />
                                <span className="text-sm font-medium text-foreground">
                                    {item.name}
                                </span>
                            </div>
                            <span className="text-sm font-bold text-foreground tabular-nums">
                                {isCurrency ? formatCurrency(item.value) : `${valuePrefix}${item.value}`}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return null;
}
