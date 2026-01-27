import { PricingSeason } from '@/lib/types';
import { format, parseISO } from 'date-fns';
import { it } from 'date-fns/locale';
import { cn, formatCurrency } from '@/lib/utils';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

interface SeasonStackVisualizationProps {
    seasons: PricingSeason[];
}

export function SeasonStackVisualization({ seasons }: SeasonStackVisualizationProps) {
    if (!seasons.length) return null;

    // Filter only active seasons
    const activeSeasons = seasons.filter(s => s.is_active);

    // Group seasons by priority level
    // High: >= 15
    // Medium: >= 5 && < 15
    // Low: < 5
    const highPriority = activeSeasons.filter(s => s.priority >= 15).sort((a, b) => b.priority - a.priority);
    const mediumPriority = activeSeasons.filter(s => s.priority >= 5 && s.priority < 15).sort((a, b) => b.priority - a.priority);
    const lowPriority = activeSeasons.filter(s => s.priority < 5).sort((a, b) => b.priority - a.priority);

    const formatDateRange = (startDate: string, endDate: string) => {
        const start = parseISO(startDate);
        const end = parseISO(endDate);
        return `${format(start, 'd MMM', { locale: it })} - ${format(end, 'd MMM', { locale: it })}`;
    };

    const SeasonBlock = ({ season, widthClass, className }: { season: PricingSeason, widthClass: string, className?: string }) => (
        <TooltipProvider>
            <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                    <div
                        className={cn(
                            "flex flex-col items-center justify-center p-3 rounded-md text-white shadow-sm transition-all hover:scale-[1.02] cursor-default border border-white/20",
                            widthClass,
                            className
                        )}
                        style={{ backgroundColor: season.color || '#3b82f6' }}
                    >
                        <span className="font-bold text-sm truncate w-full text-center px-1 drop-shadow-md">
                            {season.name}
                        </span>
                        <span className="text-[10px] opacity-90 truncate w-full text-center">
                            {formatDateRange(season.start_date, season.end_date)}
                        </span>
                    </div>
                </TooltipTrigger>
                <TooltipContent className="p-3 max-w-xs">
                    <div className="space-y-1">
                        <p className="font-bold text-base">{season.name}</p>
                        <p className="text-xs text-muted-foreground">Priorità: {season.priority}</p>
                        <p className="text-sm border-b pb-1 mb-1">{formatDateRange(season.start_date, season.end_date)}</p>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                            <span>Piazzola:</span> <span className="font-mono">{formatCurrency(season.piazzola_price_per_day)}</span>
                            <span>Persona:</span> <span className="font-mono">{formatCurrency(season.person_price_per_day)}</span>
                            <span>Bambino:</span> <span className="font-mono">{formatCurrency(season.child_price_per_day)}</span>
                            <span>Cane:</span> <span className="font-mono">{formatCurrency(season.dog_price_per_day)}</span>
                        </div>
                    </div>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );

    return (
        <div className="w-full flex flex-col items-center gap-1 py-8 px-4 bg-muted/10 rounded-xl border-2 border-dashed border-muted">
            <h4 className="text-sm font-medium text-muted-foreground mb-4 w-full text-center uppercase tracking-wider">
                Gerarchia Stagioni
            </h4>

            {/* Top Level - High Priority */}
            {highPriority.length > 0 ? (
                <div className="flex gap-2 justify-center w-full max-w-[30%]">
                    {highPriority.map(season => (
                        <SeasonBlock
                            key={season.id}
                            season={season}
                            widthClass="flex-1 min-w-[120px]"
                            className="z-30 shadow-lg ring-2 ring-white/50 dark:ring-black/50"
                        />
                    ))}
                </div>
            ) : (
                <div className="h-10 w-32 border-2 border-dashed border-muted-foreground/20 rounded flex items-center justify-center text-[10px] text-muted-foreground/40 mb-1">
                    Alta Priorità vuota
                </div>
            )}

            {/* Middle Level - Medium Priority */}
            {mediumPriority.length > 0 ? (
                <div className="flex gap-2 justify-center w-full max-w-[60%]">
                    {mediumPriority.map(season => (
                        <SeasonBlock
                            key={season.id}
                            season={season}
                            widthClass="flex-1 min-w-[140px]"
                            className="z-20 shadow-md"
                        />
                    ))}
                </div>
            ) : highPriority.length > 0 && lowPriority.length > 0 ? (
                <div className="h-10 w-64 border-2 border-dashed border-muted-foreground/20 rounded flex items-center justify-center text-[10px] text-muted-foreground/40 my-1">
                    Media Priorità vuota
                </div>
            ) : null}

            {/* Base Level - Low Priority (Default) */}
            {lowPriority.length > 0 ? (
                <div className="flex gap-2 justify-center w-full max-w-[90%]">
                    {lowPriority.map(season => (
                        <SeasonBlock
                            key={season.id}
                            season={season}
                            widthClass="flex-1 min-w-[200px]"
                            className="z-10"
                        />
                    ))}
                </div>
            ) : (
                <div className="w-full max-w-[80%] text-center text-xs text-muted-foreground py-2 italic opacity-50">
                    Nessuna stagione base definita
                </div>
            )}

            <div className="mt-2 text-[10px] text-muted-foreground/60 text-center max-w-sm">
                Le stagioni in alto hanno priorità maggiore e sovrascrivono quelle sottostanti in caso di sovrapposizione date.
            </div>
        </div>
    );
}
