'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Grid, Calendar, RefreshCw, Zap } from 'lucide-react';
import type { Pitch } from '@/lib/types';
import { SECTORS } from '@/lib/pitchUtils';
import { addDays, format, startOfDay, isWithinInterval, parseISO } from 'date-fns';
import { it } from 'date-fns/locale';

interface DayOccupancy {
    date: string;
    isOccupied: boolean;
    bookingInfo?: {
        customer_name: string;
        guests_count: number;
    };
}

interface PitchWithDays {
    pitch: Pitch;
    days: DayOccupancy[];
}

// Timeframe options
const TIMEFRAMES = [
    { id: '3day', name: '3 Giorni', days: 3 },
    { id: 'weekly', name: 'Settimanale', days: 7 },
    { id: 'monthly', name: 'Mensile', days: 30 },
];

// PERSISTENT CACHE in localStorage - cancellato solo su nuova prenotazione
const CACHE_KEY_PREFIX = 'occupancy_cache_';
const CACHE_VERSION_KEY = 'occupancy_cache_version';

function getCacheVersion(): string {
    if (typeof window === 'undefined') return '0';
    return localStorage.getItem(CACHE_VERSION_KEY) || '0';
}

export function invalidateOccupancyCache() {
    if (typeof window === 'undefined') return;
    const newVersion = (parseInt(getCacheVersion()) + 1).toString();
    localStorage.setItem(CACHE_VERSION_KEY, newVersion);
    console.log('🗑️ Occupancy cache invalidated - version:', newVersion);
}

function getCachedData(key: string): PitchWithDays[] | null {
    if (typeof window === 'undefined') return null;
    try {
        const item = localStorage.getItem(CACHE_KEY_PREFIX + key);
        if (!item) return null;

        const parsed = JSON.parse(item);
        if (parsed.version !== getCacheVersion()) {
            localStorage.removeItem(CACHE_KEY_PREFIX + key);
            return null;
        }

        console.log('📦 Cache HIT:', key);
        return parsed.data;
    } catch (error) {
        console.error('Error reading cache:', error);
        return null;
    }
}

function setCachedData(key: string, data: PitchWithDays[]) {
    if (typeof window === 'undefined') return;
    try {
        const cacheObject = {
            version: getCacheVersion(),
            timestamp: Date.now(),
            data,
        };
        localStorage.setItem(CACHE_KEY_PREFIX + key, JSON.stringify(cacheObject));
        console.log('💾 Cache SAVED:', key);
    } catch (error) {
        console.error('Error writing cache:', error);
    }
}

export function SectorOccupancyViewer() {
    const [selectedSector, setSelectedSector] = useState(SECTORS[0]);
    const [selectedTimeframe, setSelectedTimeframe] = useState(TIMEFRAMES[1]); // Default: Settimanale
    const [pitchesWithDays, setPitchesWithDays] = useState<PitchWithDays[]>([]);
    const [loading, setLoading] = useState(false);
    const [dateRange, setDateRange] = useState<Date[]>([]);

    useEffect(() => {
        const today = startOfDay(new Date());
        const dates = Array.from({ length: selectedTimeframe.days }, (_, i) => addDays(today, i));
        setDateRange(dates);
    }, [selectedTimeframe]);

    const cacheKey = useMemo(() => {
        if (dateRange.length === 0) return '';
        const startDate = format(dateRange[0], 'yyyy-MM-dd');
        const endDate = format(dateRange[dateRange.length - 1], 'yyyy-MM-dd');
        return `${selectedSector.id}_${selectedTimeframe.id}_${startDate}_${endDate}`;
    }, [selectedSector, selectedTimeframe, dateRange]);

    const loadSectorOccupancy = useCallback(async (forceRefresh: boolean = false) => {
        if (dateRange.length === 0) return;

        // Check cache
        if (!forceRefresh && cacheKey) {
            const cached = getCachedData(cacheKey);
            if (cached) {
                setPitchesWithDays(cached);
                return;
            }
        }

        setLoading(true);
        const startTime = performance.now();

        try {
            const startDate = format(dateRange[0], 'yyyy-MM-dd');
            const endDate = format(addDays(dateRange[dateRange.length - 1], 1), 'yyyy-MM-dd');

            console.log(`⚡ BATCH Loading ${selectedSector.name} (${dateRange.length} days)...`);

            // UNA SOLA richiesta batch invece di centinaia!
            const response = await fetch('/api/occupancy/batch?' + new URLSearchParams({
                sector_min: selectedSector.range.min.toString(),
                sector_max: selectedSector.range.max.toString(),
                date_from: startDate,
                date_to: endDate,
            }));

            if (!response.ok) {
                throw new Error('Failed to load occupancy data');
            }

            const data = await response.json();
            const pitches: Pitch[] = data.pitches || [];
            const bookings = data.bookings || [];

            // Client-side processing: match bookings to pitch/date combinations
            const pitchesWithOccupancy: PitchWithDays[] = pitches.map((pitch) => {
                const daysOccupancy = dateRange.map((date) => {
                    const dateStr = format(date, 'yyyy-MM-dd');

                    // Find booking for this pitch that overlaps this date
                    const booking = bookings.find((b: any) => {
                        if (b.pitch_id !== pitch.id) return false;
                        if (!b.check_in || !b.check_out) return false;

                        try {
                            const checkIn = parseISO(b.check_in);
                            const checkOut = parseISO(b.check_out);
                            const currentDate = parseISO(dateStr);

                            // Check if date is within booking range (inclusive start, exclusive end)
                            return currentDate >= checkIn && currentDate < checkOut;
                        } catch (e) {
                            return false;
                        }
                    });

                    return {
                        date: dateStr,
                        isOccupied: !!booking,
                        bookingInfo: booking ? {
                            customer_name: booking.customer_name || 'N/A',
                            guests_count: booking.guests_count || 0,
                        } : undefined,
                    };
                });

                return { pitch, days: daysOccupancy };
            });

            const endTime = performance.now();
            console.log(`✅ BATCH Loaded in ${Math.round(endTime - startTime)}ms: ${pitches.length} pitches, ${bookings.length} bookings`);

            setPitchesWithDays(pitchesWithOccupancy);
            setCachedData(cacheKey, pitchesWithOccupancy);

        } catch (error) {
            console.error('Error loading sector occupancy:', error);
        } finally {
            setLoading(false);
        }
    }, [selectedSector, dateRange, cacheKey]);

    useEffect(() => {
        if (cacheKey) {
            loadSectorOccupancy(false);
        }
    }, [cacheKey, loadSectorOccupancy]);

    const handleRefresh = () => {
        loadSectorOccupancy(true);
    };

    const getCellColor = (isOccupied: boolean) => {
        return isOccupied
            ? 'bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50'
            : 'bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-900/50';
    };

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 justify-between">
                    <div className="flex items-center gap-2">
                        <Grid className="h-5 w-5" />
                        Vista Occupazione per Settore
                        <Badge variant="outline" className="text-xs gap-1">
                            <Zap className="h-3 w-3" />
                            Batch API
                        </Badge>
                    </div>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={handleRefresh}
                        disabled={loading}
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Ricarica
                    </Button>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col md:flex-row gap-4 mb-4">
                    <div className="flex-1">
                        <label className="text-sm font-medium mb-2 block">Settore</label>
                        <div className="flex flex-wrap gap-2">
                            {SECTORS.map((sector) => (
                                <Button
                                    key={sector.id}
                                    variant={selectedSector.id === sector.id ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setSelectedSector(sector)}
                                >
                                    {sector.name} ({sector.range.min}-{sector.range.max})
                                </Button>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1">
                        <label className="text-sm font-medium mb-2 block flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Periodo
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {TIMEFRAMES.map((timeframe) => (
                                <Button
                                    key={timeframe.id}
                                    variant={selectedTimeframe.id === timeframe.id ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setSelectedTimeframe(timeframe)}
                                >
                                    {timeframe.name}
                                </Button>
                            ))}
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-muted-foreground" />
                            <div className="text-muted-foreground">Caricamento {selectedSector.name}...</div>
                            <div className="text-xs text-muted-foreground mt-1">
                                Ottimizzato con batch API
                            </div>
                        </div>
                    </div>
                ) : pitchesWithDays.length === 0 ? (
                    <div className="flex items-center justify-center py-12 border rounded-md">
                        <div className="text-center text-muted-foreground">
                            <p className="font-medium">Nessuna piazzola trovata in questo settore</p>
                            <p className="text-sm mt-1">Verifica che le piazzole siano state inserite nel database</p>
                        </div>
                    </div>
                ) : (
                    <div className="overflow-x-auto border rounded-md">
                        <table className="w-full text-xs">
                            <thead className="bg-muted">
                                <tr>
                                    <th className="sticky left-0 bg-muted z-10 p-2 text-left font-semibold border-r border-b min-w-[80px]">
                                        Piazzola
                                    </th>
                                    <th className="p-2 text-left font-semibold border-r border-b min-w-[60px]">
                                        Tipo
                                    </th>
                                    {dateRange.map((date) => {
                                        const dayFormat = selectedTimeframe.days === 3
                                            ? format(date, 'EEEE', { locale: it })
                                            : format(date, 'EEE', { locale: it });
                                        const dateFormat = selectedTimeframe.days === 3
                                            ? format(date, 'dd/MM/yyyy')
                                            : format(date, 'dd/MM');
                                        const colWidth = selectedTimeframe.days === 3
                                            ? 'min-w-[100px]'
                                            : selectedTimeframe.days === 7
                                                ? 'min-w-[70px]'
                                                : 'min-w-[45px]';

                                        return (
                                            <th
                                                key={date.toISOString()}
                                                className={`p-2 text-center font-semibold border-r border-b ${colWidth}`}
                                            >
                                                <div className="flex flex-col">
                                                    <span className={selectedTimeframe.days === 3 ? 'text-xs' : 'text-[10px]'}>
                                                        {dayFormat}
                                                    </span>
                                                    <span className={selectedTimeframe.days === 3 ? 'text-sm font-bold' : ''}>
                                                        {dateFormat}
                                                    </span>
                                                </div>
                                            </th>
                                        );
                                    })}
                                </tr>
                            </thead>
                            <tbody>
                                {pitchesWithDays.map((item) => (
                                    <tr key={item.pitch.id} className="hover:bg-muted/50">
                                        <td className="sticky left-0 bg-background z-10 p-2 font-medium border-r">
                                            {item.pitch.number}
                                        </td>
                                        <td className="p-2 border-r">
                                            <Badge variant="secondary" className="text-[10px]">
                                                {item.pitch.type}
                                            </Badge>
                                        </td>
                                        {item.days.map((day) => (
                                            <td
                                                key={day.date}
                                                className={`p-1 border-r cursor-pointer transition-colors ${getCellColor(day.isOccupied)}`}
                                                onClick={() => {
                                                    if (day.isOccupied && day.bookingInfo) {
                                                        alert(
                                                            `Piazzola ${item.pitch.number} - ${day.date}\n` +
                                                            `Cliente: ${day.bookingInfo.customer_name}\n` +
                                                            `Ospiti: ${day.bookingInfo.guests_count}`
                                                        );
                                                    }
                                                }}
                                                title={
                                                    day.isOccupied && day.bookingInfo
                                                        ? `${day.bookingInfo.customer_name} (${day.bookingInfo.guests_count} ospiti)`
                                                        : 'Libera'
                                                }
                                            >
                                                <div className="h-6 w-full flex items-center justify-center">
                                                    {day.isOccupied && (
                                                        <div className="w-2 h-2 rounded-full bg-red-600" />
                                                    )}
                                                </div>
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-green-100 dark:bg-green-900/30 border rounded" />
                            <span>Libera</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-red-100 dark:bg-red-900/30 border rounded flex items-center justify-center">
                                <div className="w-2 h-2 rounded-full bg-red-600" />
                            </div>
                            <span>Occupata</span>
                        </div>
                    </div>
                    {dateRange.length > 0 && (
                        <div className="text-xs text-muted-foreground">
                            {format(dateRange[0], 'dd/MM/yyyy')} - {format(dateRange[dateRange.length - 1], 'dd/MM/yyyy')}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
