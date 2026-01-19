'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowUpCircle, Search } from 'lucide-react';
import { format, addDays, startOfDay } from 'date-fns';
import { it } from 'date-fns/locale';
import { toast } from 'sonner';
import Link from 'next/link';
import { DashboardData, DashboardEvent } from '@/types/dashboard';
import { GuestCard } from '@/components/shared/GuestCard';
import { DateToggle } from '@/components/shared/DateToggle';
import { Input } from '@/components/ui/input';

type ViewType = 'today' | 'tomorrow' | 'week';

export default function DeparturesPage() {
    const [view, setView] = useState<ViewType>('today');
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');

    useEffect(() => {
        loadDepartures();
    }, [view]);

    const loadDepartures = async () => {
        setLoading(true);
        try {
            const today = startOfDay(new Date());
            let startDate = today;
            let endDate = today;

            if (view === 'tomorrow') {
                startDate = addDays(today, 1);
                endDate = startDate;
            } else if (view === 'week') {
                endDate = addDays(today, 6);
            }

            const startStr = format(startDate, 'yyyy-MM-dd');
            const endStr = format(endDate, 'yyyy-MM-dd');

            const response = await fetch(`/api/today?startDate=${startStr}&endDate=${endStr}`);

            if (response.ok) {
                const result = await response.json();
                setData(result);
            } else {
                toast.error('Errore caricamento partenze');
            }
        } catch (error) {
            console.error('Error loading departures:', error);
            toast.error('Errore imprevisto', {
                description: 'Impossibile caricare i dati delle partenze'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleViewToggle = (newView: ViewType) => {
        setView(newView);
    };

    const filteredDepartures = data?.departures.filter(departure =>
        departure.customers.first_name.toLowerCase().includes(filter.toLowerCase()) ||
        departure.customers.last_name.toLowerCase().includes(filter.toLowerCase()) ||
        departure.pitches.number.includes(filter)
    ) || [];

    // Group departures by date for Week view
    const groupedDepartures: Record<string, DashboardEvent[]> = {};
    if (view === 'week') {
        filteredDepartures.forEach(departure => {
            const dateMatch = departure.booking_period.match(/,([^\)]+)\)/);
            const date = dateMatch ? dateMatch[1] : 'Sconosciuto';
            if (!groupedDepartures[date]) {
                groupedDepartures[date] = [];
            }
            groupedDepartures[date].push(departure);
        });
    }

    // Sort dates for display
    const sortedDates = Object.keys(groupedDepartures).sort();

    return (
        <div className="flex flex-col h-screen bg-background">
            {/* Header Sticky */}
            <header className="sticky top-0 z-10 border-b bg-card/80 backdrop-blur-sm shadow-sm">
                <div className="container mx-auto px-4 py-4 max-w-7xl">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <Link href="/">
                                <Button variant="ghost" size="icon" className="h-10 w-10">
                                    <ArrowLeft className="h-6 w-6" />
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-2xl font-bold flex items-center gap-2 text-foreground">
                                    <ArrowUpCircle className="h-6 w-6 text-blue-600" />
                                    Partenze
                                </h1>
                                <p className="text-sm text-muted-foreground hidden sm:block">
                                    {view === 'week'
                                        ? "Prossimi 7 giorni"
                                        : format(view === 'tomorrow' ? addDays(new Date(), 1) : new Date(), 'EEEE d MMMM yyyy', { locale: it })
                                    }
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="relative w-full md:w-64">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Cerca ospite o piazzola..."
                                    className="pl-9 h-9"
                                    value={filter}
                                    onChange={(e) => setFilter(e.target.value)}
                                />
                            </div>
                            <DateToggle currentView={view} onToggle={handleViewToggle} />
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content Scrollable */}
            <main className="flex-1 overflow-auto p-4 md:p-6 bg-muted/10">
                <div className="container mx-auto max-w-7xl">
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="h-32 bg-muted rounded-xl animate-pulse" />
                            ))}
                        </div>
                    ) : !data || filteredDepartures.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-[50vh] text-center">
                            <div className="bg-blue-100 dark:bg-blue-900/20 p-6 rounded-full mb-4">
                                <ArrowUpCircle className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                            </div>
                            <h2 className="text-xl font-semibold mb-2">Nessuna partenza trovata</h2>
                            <p className="text-muted-foreground">
                                {data?.total_departures === 0
                                    ? `Nessuna partenza prevista`
                                    : "Nessun risultato corrisponde alla tua ricerca"}
                            </p>
                        </div>
                    ) : (
                        <>
                            {view === 'week' ? (
                                <div className="space-y-8">
                                    {sortedDates.map(date => (
                                        <div key={date}>
                                            <h3 className="text-lg font-semibold mb-4 sticky top-0 bg-background/95 backdrop-blur py-2 px-1 border-b z-0">
                                                {format(new Date(date), 'EEEE d MMMM', { locale: it })}
                                                <span className="ml-2 text-sm font-normal text-muted-foreground">
                                                    ({groupedDepartures[date].length})
                                                </span>
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                                {groupedDepartures[date].map(departure => (
                                                    <GuestCard key={departure.id} event={departure} type="departure" />
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                    {filteredDepartures.map((departure) => (
                                        <GuestCard key={departure.id} event={departure} type="departure" />
                                    ))}
                                </div>
                            )}

                            <div className="mt-8 text-center text-sm text-muted-foreground">
                                Visualizzando {filteredDepartures.length} di {data.total_departures} partenze
                            </div>
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}
