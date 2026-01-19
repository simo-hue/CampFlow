'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Calendar, CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import type { Pitch } from '@/lib/types';

export function AvailabilityModule() {
    const [checkInDate, setCheckInDate] = useState<Date>();
    const [checkOutDate, setCheckOutDate] = useState<Date>();
    const [pitchType, setPitchType] = useState<string>('all');
    const [loading, setLoading] = useState(false);
    const [checkInOpen, setCheckInOpen] = useState(false);
    const [checkOutOpen, setCheckOutOpen] = useState(false);
    const [results, setResults] = useState<{
        pitches: Pitch[];
        total_available: number;
    } | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleSearch = async () => {
        if (!checkInDate || !checkOutDate) {
            setError('Inserisci entrambe le date');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const params = new URLSearchParams({
                check_in: format(checkInDate, 'yyyy-MM-dd'),
                check_out: format(checkOutDate, 'yyyy-MM-dd'),
            });

            if (pitchType !== 'all') {
                params.append('pitch_type', pitchType);
            }

            const response = await fetch(`/api/availability?${params}`);

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Errore nella ricerca');
            }

            const data = await response.json();
            setResults(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Errore sconosciuto');
            setResults(null);
        } finally {
            setLoading(false);
        }
    };

    const getAttributeBadges = (attributes: Record<string, unknown>) => {
        const badges = [];
        const attrs = attributes as { shade?: boolean; electricity?: boolean; water?: boolean; sewer?: boolean };
        if (attrs.shade) badges.push('Ombra');
        if (attrs.electricity) badges.push('Elettricità');
        if (attrs.water) badges.push('Acqua');
        if (attrs.sewer) badges.push('Scarico');
        return badges;
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Cerca Piazzole Disponibili
                </CardTitle>
            </CardHeader>
            <CardContent>
                {/* Search Form */}
                <div className="grid gap-4 md:grid-cols-4 mb-6">
                    {/* Check-in Date Picker */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Data Arrivo</label>
                        <Popover open={checkInOpen} onOpenChange={setCheckInOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        'w-full justify-start text-left font-normal',
                                        !checkInDate && 'text-muted-foreground'
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {checkInDate ? format(checkInDate, 'dd MMM yyyy', { locale: it }) : 'Seleziona data'}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <CalendarComponent
                                    mode="single"
                                    selected={checkInDate}
                                    onSelect={(date) => {
                                        setCheckInDate(date);
                                        setCheckInOpen(false);
                                    }}
                                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    {/* Check-out Date Picker */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Data Partenza</label>
                        <Popover open={checkOutOpen} onOpenChange={setCheckOutOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        'w-full justify-start text-left font-normal',
                                        !checkOutDate && 'text-muted-foreground'
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {checkOutDate ? format(checkOutDate, 'dd MMM yyyy', { locale: it }) : 'Seleziona data'}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <CalendarComponent
                                    mode="single"
                                    selected={checkOutDate}
                                    onSelect={(date) => {
                                        setCheckOutDate(date);
                                        setCheckOutOpen(false);
                                    }}
                                    disabled={(date) => {
                                        const minDate = checkInDate || new Date(new Date().setHours(0, 0, 0, 0));
                                        return date <= minDate;
                                    }}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Tipo</label>
                        <select
                            value={pitchType}
                            onChange={(e) => setPitchType(e.target.value)}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                            <option value="all">Tutti</option>
                            <option value="piazzola">Piazzola</option>
                            <option value="tenda">Tenda</option>
                        </select>
                    </div>

                    <div className="flex items-end">
                        <Button
                            onClick={handleSearch}
                            disabled={loading || !checkInDate || !checkOutDate}
                            className="w-full"
                        >
                            {loading ? 'Ricerca...' : 'Cerca'}
                        </Button>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="p-4 mb-4 bg-destructive/10 border border-destructive rounded-md">
                        <p className="text-sm text-destructive">{error}</p>
                    </div>
                )}

                {/* Results */}
                {results && (
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">
                                Piazzole Disponibili: {results.total_available}
                            </h3>
                            {results.total_available > 0 && (
                                <Badge variant="default" className="bg-green-500">
                                    {results.total_available} libere
                                </Badge>
                            )}
                        </div>

                        {results.total_available === 0 ? (
                            <div className="p-8 text-center text-muted-foreground border rounded-md">
                                <p>Nessuna piazzola disponibile per il periodo selezionato</p>
                            </div>
                        ) : (
                            <div className="border rounded-md">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Numero</TableHead>
                                            <TableHead>Tipo</TableHead>
                                            <TableHead>Dimensione</TableHead>
                                            <TableHead>Caratteristiche</TableHead>
                                            <TableHead className="text-right">Azioni</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {results.pitches.map((pitch) => (
                                            <TableRow key={pitch.id}>
                                                <TableCell className="font-medium">{pitch.number}</TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary">{pitch.type}</Badge>
                                                </TableCell>
                                                <TableCell>{pitch.attributes.size_sqm || '-'} m²</TableCell>
                                                <TableCell>
                                                    <div className="flex gap-1 flex-wrap">
                                                        {getAttributeBadges(pitch.attributes).map((attr) => (
                                                            <Badge key={attr} variant="outline" className="text-xs">
                                                                {attr}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        size="sm"
                                                        onClick={() => {
                                                            // TODO: Open booking modal
                                                            console.log('Book pitch:', pitch.id);
                                                        }}
                                                    >
                                                        Prenota
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
