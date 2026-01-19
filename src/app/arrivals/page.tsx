'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CalendarCheck, ArrowLeft, ArrowRight, ArrowDownCircle } from 'lucide-react';
import { format, addDays, isSameDay } from 'date-fns';
import { it } from 'date-fns/locale';
import { toast } from 'sonner';
import Link from 'next/link';

interface ArrivalEvent {
    id: string;
    pitch_id: string;
    guests_count: number;
    pitches: { number: string; type: string };
    customers: { first_name: string; last_name: string };
}

interface ArrivalsData {
    date: string;
    arrivals: ArrivalEvent[];
    total_arrivals: number;
}

export default function ArrivalsPage() {
    const [date, setDate] = useState(new Date());
    const [data, setData] = useState<ArrivalsData | null>(null);
    const [loading, setLoading] = useState(true);

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

    return (
        <div className="container mx-auto px-4 py-6 max-w-4xl">
            <div className="flex items-center gap-4 mb-6">
                <Link href="/">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <ArrowDownCircle className="h-6 w-6 text-green-600" />
                        Arrivi
                    </h1>
                    <p className="text-muted-foreground">
                        Gestione check-in e nuovi ingressi
                    </p>
                </div>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDate(new Date())}
                            className={isToday ? 'bg-primary/10 border-primary text-primary' : ''}
                        >
                            Oggi
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDate(addDays(new Date(), 1))}
                            className={isSameDay(date, addDays(new Date(), 1)) ? 'bg-primary/10 border-primary text-primary' : ''}
                        >
                            Domani
                        </Button>
                    </div>
                    <div className="flex items-center gap-2 text-sm font-medium">
                        <CalendarCheck className="h-4 w-4 text-muted-foreground" />
                        {format(date, 'EEEE d MMMM yyyy', { locale: it })}
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="space-y-3 py-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-16 bg-muted rounded animate-pulse" />
                            ))}
                        </div>
                    ) : !data || data.total_arrivals === 0 ? (
                        <div className="text-center py-12 border-2 border-dashed rounded-lg bg-muted/20">
                            <ArrowDownCircle className="h-12 w-12 mx-auto text-green-200 mb-3" />
                            <p className="text-muted-foreground font-medium">Nessun arrivo previsto per questa data</p>
                            <p className="text-sm text-muted-foreground/60 mt-1">Nessuna prenotazione inizia il {format(date, 'd MMMM')}</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {data.arrivals.map((arrival) => (
                                <div
                                    key={arrival.id}
                                    className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-accent/50 transition-colors shadow-sm"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="bg-green-100 dark:bg-green-900/30 p-2.5 rounded-full">
                                            <span className="font-bold text-green-700 dark:text-green-300 text-lg">
                                                {arrival.pitches.number}
                                            </span>
                                        </div>
                                        <div>
                                            <div className="font-semibold text-lg">
                                                {arrival.customers.first_name} {arrival.customers.last_name}
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-0.5">
                                                <Badge variant="outline" className="font-normal">
                                                    {arrival.pitches.type === 'piazzola' ? 'Piazzola' : 'Tenda'}
                                                </Badge>
                                                <span>•</span>
                                                <span>{arrival.guests_count} ospiti</span>
                                            </div>
                                        </div>
                                    </div>

                                    <Button variant="default" className="bg-green-600 hover:bg-green-700">
                                        Check-in
                                    </Button>
                                </div>
                            ))}

                            <div className="mt-6 pt-4 border-t text-sm text-muted-foreground text-center">
                                Totale arrivi: <strong>{data.total_arrivals}</strong>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
