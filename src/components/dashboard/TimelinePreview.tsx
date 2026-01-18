'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';

interface TimelineEvent {
    time: string;
    type: 'arrival' | 'departure';
    customer: string;
    pitch: string;
}

export function TimelinePreview() {
    // Use useMemo instead of useEffect to avoid setState in effect
    const events = useMemo(() => {
        // TODO: Fetch today's events from API
        // Placeholder data for now
        return [
            { time: '10:00', type: 'arrival' as const, customer: 'Mario Rossi', pitch: '045' },
            { time: '12:00', type: 'departure' as const, customer: 'Lucia Bianchi', pitch: '102' },
            { time: '14:30', type: 'arrival' as const, customer: 'Giovanni Verdi', pitch: '201' },
            { time: '16:00', type: 'departure' as const, customer: 'Anna Neri', pitch: '078' },
        ];
    }, []);

    const loading = false; // Set to true when implementing real API fetch

    const getCurrentTime = () => {
        const now = new Date();
        return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Timeline Prossime 24h
                </CardTitle>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-16 bg-muted rounded animate-pulse" />
                        ))}
                    </div>
                ) : events.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        <p>Nessun evento previsto per oggi</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {/* Current Time Indicator */}
                        <div className="flex items-center gap-2 text-sm font-medium text-primary">
                            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                            <span>Ora attuale: {getCurrentTime()}</span>
                        </div>

                        {/* Events List */}
                        <div className="space-y-2">
                            {events.map((event, index) => (
                                <div
                                    key={index}
                                    className="flex items-center gap-3 p-3 border rounded-md hover:bg-muted/50 transition-colors"
                                >
                                    <div className="flex-shrink-0 w-16 text-sm font-medium">
                                        {event.time}
                                    </div>
                                    <div className="flex-shrink-0">
                                        <Badge
                                            variant={event.type === 'arrival' ? 'default' : 'secondary'}
                                            className={
                                                event.type === 'arrival'
                                                    ? 'bg-green-500 hover:bg-green-600'
                                                    : 'bg-blue-500 hover:bg-blue-600'
                                            }
                                        >
                                            {event.type === 'arrival' ? '📥 Arrivo' : '📤 Partenza'}
                                        </Badge>
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-sm">{event.customer}</p>
                                        <p className="text-xs text-muted-foreground">Piazzola {event.pitch}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
