'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarCheck, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

interface TodayEvent {
    id: string;
    pitch_id: string;
    guests_count: number;
    pitches: { number: string };
    customers: { full_name: string };
}

interface TodayData {
    date: string;
    arrivals: TodayEvent[];
    departures: TodayEvent[];
    total_arrivals: number;
    total_departures: number;
}

export function TodayView() {
    const [data, setData] = useState<TodayData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadTodayEvents();

        // Auto-refresh every 5 minutes
        const interval = setInterval(loadTodayEvents, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    const loadTodayEvents = async () => {
        try {
            const response = await fetch('/api/today');
            if (response.ok) {
                const todayData = await response.json();
                setData(todayData);
            }
        } catch (error) {
            console.error('Error loading today events:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <CalendarCheck className="h-5 w-5" />
                        Oggi
                    </div>
                    <span className="text-sm font-normal text-muted-foreground">
                        {format(new Date(), 'EEEE d MMMM yyyy', { locale: it })}
                    </span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-16 bg-muted rounded animate-pulse" />
                        ))}
                    </div>
                ) : !data || (data.total_arrivals === 0 && data.total_departures === 0) ? (
                    <div className="text-center py-8 text-muted-foreground">
                        <p>Nessun arrivo o partenza previsto per oggi</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Arrivals Section */}
                        {data.total_arrivals > 0 && (
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <ArrowDownCircle className="h-4 w-4 text-green-600" />
                                    <h3 className="font-semibold text-sm">
                                        Arrivi ({data.total_arrivals})
                                    </h3>
                                </div>
                                <div className="space-y-2">
                                    {data.arrivals.map((arrival) => (
                                        <div
                                            key={arrival.id}
                                            className="flex items-center justify-between p-3 border rounded-md bg-green-50 dark:bg-green-950/20 hover:bg-green-100 dark:hover:bg-green-950/30 transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <Badge variant="outline" className="bg-background">
                                                    Piazzola {arrival.pitches.number}
                                                </Badge>
                                                <div>
                                                    <p className="font-medium text-sm">{arrival.customers.full_name}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {arrival.guests_count} {arrival.guests_count === 1 ? 'ospite' : 'ospiti'}
                                                    </p>
                                                </div>
                                            </div>
                                            <Badge className="bg-green-500 hover:bg-green-600">
                                                Arrivo
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Departures Section */}
                        {data.total_departures > 0 && (
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <ArrowUpCircle className="h-4 w-4 text-blue-600" />
                                    <h3 className="font-semibold text-sm">
                                        Partenze ({data.total_departures})
                                    </h3>
                                </div>
                                <div className="space-y-2">
                                    {data.departures.map((departure) => (
                                        <div
                                            key={departure.id}
                                            className="flex items-center justify-between p-3 border rounded-md bg-blue-50 dark:bg-blue-950/20 hover:bg-blue-100 dark:hover:bg-blue-950/30 transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <Badge variant="outline" className="bg-background">
                                                    Piazzola {departure.pitches.number}
                                                </Badge>
                                                <div>
                                                    <p className="font-medium text-sm">{departure.customers.full_name}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {departure.guests_count} {departure.guests_count === 1 ? 'ospite' : 'ospiti'}
                                                    </p>
                                                </div>
                                            </div>
                                            <Badge className="bg-blue-500 hover:bg-blue-600">
                                                Partenza
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
