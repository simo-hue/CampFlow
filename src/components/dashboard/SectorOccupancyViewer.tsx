'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Grid, Calendar } from 'lucide-react';
import type { Pitch } from '@/lib/types';
import { SECTORS } from '@/lib/pitchUtils';
import { addDays, format, startOfDay } from 'date-fns';
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

export function SectorOccupancyViewer() {
    const [selectedSector, setSelectedSector] = useState(SECTORS[0]);
    const [selectedTimeframe, setSelectedTimeframe] = useState(TIMEFRAMES[2]); // Default: Mensile
    const [pitchesWithDays, setPitchesWithDays] = useState<PitchWithDays[]>([]);
    const [loading, setLoading] = useState(false);
    const [dateRange, setDateRange] = useState<Date[]>([]);

    // Genera array di date basato sul timeframe selezionato
    useEffect(() => {
        const today = startOfDay(new Date());
        const dates = Array.from({ length: selectedTimeframe.days }, (_, i) => addDays(today, i));
        setDateRange(dates);
    }, [selectedTimeframe]);

    const loadSectorOccupancy = useCallback(async () => {
        if (dateRange.length === 0) return;

        setLoading(true);
        try {
            // Step 1: Get all pitches in the sector
            const pitchesResponse = await fetch('/api/pitches/sector?' + new URLSearchParams({
                min: selectedSector.range.min.toString(),
                max: selectedSector.range.max.toString(),
            }));

            if (!pitchesResponse.ok) {
                throw new Error('Failed to load pitches');
            }

            const pitchesData = await pitchesResponse.json();
            const pitches: Pitch[] = pitchesData.pitches || [];

            // Step 2: For each pitch, check occupancy for each day
            const pitchesWithOccupancy = await Promise.all(
                pitches.map(async (pitch) => {
                    const daysOccupancy = await Promise.all(
                        dateRange.map(async (date) => {
                            const dateStr = format(date, 'yyyy-MM-dd');
                            const nextDay = format(addDays(date, 1), 'yyyy-MM-dd');

                            const occupancyResponse = await fetch('/api/occupancy?' + new URLSearchParams({
                                pitch_id: pitch.id,
                                check_in: dateStr,
                                check_out: nextDay,
                            }));

                            if (occupancyResponse.ok) {
                                const data = await occupancyResponse.json();
                                return {
                                    date: dateStr,
                                    isOccupied: data.is_occupied,
                                    bookingInfo: data.booking ? {
                                        customer_name: data.booking.customer_name,
                                        guests_count: data.booking.guests_count,
                                    } : undefined,
                                };
                            }

                            return { date: dateStr, isOccupied: false };
                        })
                    );

                    return {
                        pitch,
                        days: daysOccupancy,
                    };
                })
            );

            setPitchesWithDays(pitchesWithOccupancy);
        } catch (error) {
            console.error('Error loading sector occupancy:', error);
        } finally {
            setLoading(false);
        }
    }, [selectedSector, dateRange]);

    useEffect(() => {
        loadSectorOccupancy();
    }, [loadSectorOccupancy]);

    const getCellColor = (isOccupied: boolean) => {
        return isOccupied
            ? 'bg-red-100 hover:bg-red-200'
            : 'bg-green-100 hover:bg-green-200';
    };

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Grid className="h-5 w-5" />
                    Vista Occupazione per Settore
                </CardTitle>
            </CardHeader>
            <CardContent>
                {/* Selectors Row */}
                <div className="flex flex-col md:flex-row gap-4 mb-4">
                    {/* Sector Selector */}
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
                                    {sector.name}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Timeframe Selector */}
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

                {/* Calendar Table */}
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="text-muted-foreground">Caricamento settore...</div>
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

                {/* Legend */}
                <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-green-100 border rounded" />
                            <span>Libera</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-red-100 border rounded flex items-center justify-center">
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
