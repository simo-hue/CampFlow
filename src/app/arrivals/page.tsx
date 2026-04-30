'use client';
import { logger } from '@/lib/logger';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowDownCircle, Search, CalendarIcon } from 'lucide-react';
import { format, addDays, subDays, startOfDay } from 'date-fns';
import { it } from 'date-fns/locale';
import { toast } from 'sonner';
import Link from 'next/link';
import { DashboardData, DashboardEvent } from '@/types/dashboard';
import { GuestCard } from '@/components/shared/GuestCard';
import { DateToggle } from '@/components/shared/DateToggle';
import { Input } from '@/components/ui/input';
import { ArrivalsReportButton } from '@/components/shared/ArrivalsReportButton';

type ViewType = 'yesterday' | 'today' | 'tomorrow' | 'week';

export default function ArrivalsPage() {
    const [view, setView] = useState<ViewType>('today');
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');

    useEffect(() => {
        loadArrivals();
    }, [view]);

    const loadArrivals = async () => {
        setLoading(true);
        try {
            const today = startOfDay(new Date());
            let startDate = today;
            let endDate = today;

            if (view === 'yesterday') {
                startDate = subDays(today, 1);
                endDate = startDate;
            } else if (view === 'tomorrow') {
                startDate = addDays(today, 1);
                endDate = startDate;
            } else if (view === 'week') {
                endDate = addDays(today, 6); // Today + 6 days = 7 days total
            }

            const startStr = format(startDate, 'yyyy-MM-dd');
            const endStr = format(endDate, 'yyyy-MM-dd');

            const response = await fetch(`/api/today?startDate=${startStr}&endDate=${endStr}`);

            if (response.ok) {
                const result = await response.json();
                setData(result);
            } else {
                toast.error('Errore caricamento arrivi');
            }
        } catch (error) {
            logger.error('Error loading arrivals:', { error });
            toast.error('Errore imprevisto', {
                description: 'Impossibile caricare i dati degli arrivi'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleViewToggle = (newView: ViewType) => {
        setView(newView);
    };

    const filteredArrivals = data?.arrivals
        .filter(arrival =>
            arrival.customers.first_name.toLowerCase().includes(filter.toLowerCase()) ||
            arrival.customers.last_name.toLowerCase().includes(filter.toLowerCase()) ||
            arrival.pitches.number.includes(filter)
        )
        .sort((a, b) => {
            // Pending arrivals first
            if (a.status === 'checked_in' && b.status !== 'checked_in') return 1;
            if (a.status !== 'checked_in' && b.status === 'checked_in') return -1;
            return 0;
        }) || [];

    const completedCount = data?.arrivals.filter(a => a.status === 'checked_in').length || 0;

    // Group arrivals by date for Week view
    const groupedArrivals: Record<string, DashboardEvent[]> = {};
    if (view === 'week') {
        filteredArrivals.forEach(arrival => {
            const dateMatch = arrival.booking_period.match(/\[([^,]+),/);
            const date = dateMatch ? dateMatch[1] : 'Sconosciuto';
            if (!groupedArrivals[date]) {
                groupedArrivals[date] = [];
            }
            groupedArrivals[date].push(arrival);
        });
    }

    // Sort dates for display
    const sortedDates = Object.keys(groupedArrivals).sort();

    return (
        <div className="flex flex-col h-screen bg-background">
            {/* Header Sticky */}
            <header className="sticky top-0 z-20 border-b bg-card/80 backdrop-blur-md shadow-sm">
                <div className="container mx-auto px-3 sm:px-4 py-3 max-w-5xl">
                    <div className="flex flex-col gap-3">
                        {/* Top row: back + title */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 sm:gap-4">
                                <Link href="/">
                                    <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-10 sm:w-10">
                                        <ArrowLeft className="h-5 w-5 sm:h-6 sm:w-6" />
                                    </Button>
                                </Link>
                                <div>
                                    <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2 text-foreground">
                                        <ArrowDownCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                                        Arrivi
                                        {!loading && data && (
                                            <span className="text-sm sm:text-lg font-medium text-muted-foreground ml-1">
                                                ({completedCount}/{data.total_arrivals})
                                            </span>
                                        )}
                                    </h1>
                                    <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1.5">
                                        <CalendarIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                                        {view === 'week'
                                            ? "Prossimi 7 giorni"
                                            : format(
                                                view === 'tomorrow' ? addDays(new Date(), 1)
                                                : view === 'yesterday' ? subDays(new Date(), 1)
                                                : new Date(),
                                                'EEEE d MMMM yyyy', { locale: it }
                                              )
                                        }
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Bottom row: search + controls */}
                        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                            <div className="relative flex-1 min-w-[140px]">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Cerca ospite o piazzola..."
                                    className="pl-9 h-9"
                                    value={filter}
                                    onChange={(e) => setFilter(e.target.value)}
                                />
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <DateToggle currentView={view} onToggle={handleViewToggle} />
                                <ArrivalsReportButton 
                                    view={view}
                                    defaultDate={
                                        view === 'tomorrow' ? format(addDays(new Date(), 1), 'yyyy-MM-dd')
                                        : view === 'yesterday' ? format(subDays(new Date(), 1), 'yyyy-MM-dd')
                                        : format(new Date(), 'yyyy-MM-dd')
                                    } 
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content Scrollable */}
            <main className="flex-1 overflow-auto p-4 md:p-6 bg-muted/10">
                <div className="container mx-auto max-w-5xl">
                    {loading ? (
                        <div className="space-y-4">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="h-24 bg-muted rounded-xl animate-pulse" />
                            ))}
                        </div>
                    ) : !data || filteredArrivals.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-[50vh] text-center">
                            <div className="bg-green-100 dark:bg-green-900/20 p-6 rounded-full mb-4">
                                <ArrowDownCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
                            </div>
                            <h2 className="text-xl font-semibold mb-2">Nessun arrivo trovato</h2>
                            <p className="text-muted-foreground max-w-sm mx-auto">
                                {data?.total_arrivals === 0
                                    ? `Non ci sono arrivi previsti per ${view === 'week' ? 'i prossimi giorni' : 'questa data'}.`
                                    : "Nessun risultato corrisponde alla tua ricerca. Prova a modificare i filtri."}
                            </p>
                        </div>
                    ) : (
                        <div className="pb-10">
                            {view === 'week' ? (
                                <div className="space-y-8">
                                    {sortedDates.map(date => (
                                        <div key={date}>
                                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 sticky top-0 bg-background/95 backdrop-blur py-2 z-10">
                                                {format(new Date(date), 'EEEE d MMMM', { locale: it })}
                                            </h3>
                                            <div className="space-y-3">
                                                {groupedArrivals[date].map(arrival => (
                                                    <GuestCard key={arrival.id} event={arrival} type="arrival" onRefresh={loadArrivals} />
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-8">
                                    {/* Pending Arrivals */}
                                    <div className="space-y-3">
                                        {filteredArrivals.filter(a => a.status !== 'checked_in').map((arrival) => (
                                            <GuestCard key={arrival.id} event={arrival} type="arrival" onRefresh={loadArrivals} />
                                        ))}
                                        {filteredArrivals.filter(a => a.status !== 'checked_in').length === 0 && (
                                            <div className="text-center py-8 bg-muted/20 rounded-xl border-2 border-dashed border-muted">
                                                <p className="text-muted-foreground italic text-sm">Tutti i check-in di {view === 'today' ? 'oggi' : view === 'yesterday' ? 'ieri' : 'domani'} completati!</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Completed Arrivals */}
                                    {filteredArrivals.some(a => a.status === 'checked_in') && (
                                        <div className="space-y-3">
                                            <div className="relative flex items-center py-4">
                                                <div className="flex-grow h-px bg-border"></div>
                                                <span className="flex-shrink-0 mx-4 text-[10px] font-bold text-green-600 dark:text-green-400 tracking-[0.2em] uppercase">
                                                    Completati
                                                </span>
                                                <div className="flex-grow h-px bg-border"></div>
                                            </div>
                                            <div className="space-y-3">
                                                {filteredArrivals.filter(a => a.status === 'checked_in').map((arrival) => (
                                                    <GuestCard key={arrival.id} event={arrival} type="arrival" onRefresh={loadArrivals} />
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="mt-8 text-center text-sm text-muted-foreground">
                                Visualizzando {filteredArrivals.length} di {data.total_arrivals} arrivi
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
