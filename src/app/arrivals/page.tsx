'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { CalendarCheck, ArrowLeft, ArrowDownCircle, Search } from 'lucide-react';
import { format, addDays, isSameDay } from 'date-fns';
import { it } from 'date-fns/locale';
import { toast } from 'sonner';
import Link from 'next/link';
import { DashboardData } from '@/types/dashboard';
import { GuestCard } from '@/components/shared/GuestCard';
import { DateToggle } from '@/components/shared/DateToggle';
import { Input } from '@/components/ui/input';

export default function ArrivalsPage() {
    const [date, setDate] = useState(new Date());
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');

    useEffect(() => {
        loadArrivals();
    }, [date]);

    const loadArrivals = async () => {
        setLoading(true);
        try {
            const dateStr = format(date, 'yyyy-MM-dd');
            const response = await fetch(`/api/today?date=${dateStr}`);

            if (response.ok) {
                const result = await response.json();
                setData(result);
            } else {
                toast.error('Errore caricamento arrivi');
            }
        } catch (error) {
            console.error('Error loading arrivals:', error);
            toast.error('Errore imprevisto', {
                description: 'Impossibile caricare i dati degli arrivi'
            });
        } finally {
            setLoading(false);
        }
    };

    const isToday = isSameDay(date, new Date());
    const handleDateToggle = (type: 'today' | 'tomorrow') => {
        setDate(type === 'today' ? new Date() : addDays(new Date(), 1));
    };

    const filteredArrivals = data?.arrivals.filter(arrival =>
        arrival.customers.first_name.toLowerCase().includes(filter.toLowerCase()) ||
        arrival.customers.last_name.toLowerCase().includes(filter.toLowerCase()) ||
        arrival.pitches.number.includes(filter)
    ) || [];

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
                                    <ArrowDownCircle className="h-6 w-6 text-green-600" />
                                    Arrivi
                                </h1>
                                <p className="text-sm text-muted-foreground hidden sm:block">
                                    {format(date, 'EEEE d MMMM yyyy', { locale: it })}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="relative w-full md:w-64">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Cerca ospite o piazzola..."
                                    className="pl-9"
                                    value={filter}
                                    onChange={(e) => setFilter(e.target.value)}
                                />
                            </div>
                            <DateToggle isToday={isToday} onToggle={handleDateToggle} />
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
                    ) : !data || filteredArrivals.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-[50vh] text-center">
                            <div className="bg-green-100 dark:bg-green-900/20 p-6 rounded-full mb-4">
                                <ArrowDownCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
                            </div>
                            <h2 className="text-xl font-semibold mb-2">Nessun arrivo trovato</h2>
                            <p className="text-muted-foreground">
                                {data?.total_arrivals === 0
                                    ? `Nessuna prenotazione prevista per ${isToday ? 'oggi' : 'domani'}`
                                    : "Nessun risultato corrisponde alla tua ricerca"}
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {filteredArrivals.map((arrival) => (
                                    <GuestCard key={arrival.id} event={arrival} type="arrival" />
                                ))}
                            </div>

                            <div className="mt-8 text-center text-sm text-muted-foreground">
                                Visualizzando {filteredArrivals.length} di {data.total_arrivals} arrivi
                            </div>
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}
