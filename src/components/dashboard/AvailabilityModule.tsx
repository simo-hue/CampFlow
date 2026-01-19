'use client';

import { useQueryClient } from '@tanstack/react-query';
import { BookingCreationModal } from './BookingCreationModal';

import { useState } from 'react';
import { useAvailability } from '@/hooks/useAvailability';
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

    const [checkInOpen, setCheckInOpen] = useState(false);
    const [checkOutOpen, setCheckOutOpen] = useState(false);

    // Modal state
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [selectedPitch, setSelectedPitch] = useState<Pitch | null>(null);

    const queryClient = useQueryClient();

    // React Query Hook
    const { data: results, isLoading: loading, error: queryError } = useAvailability(checkInDate, checkOutDate);
    const error = queryError instanceof Error ? queryError.message : null;

    const getAttributeBadges = (attributes: Record<string, unknown>) => {
        const badges = [];
        const attrs = attributes as { shade?: boolean; electricity?: boolean; water?: boolean; sewer?: boolean };
        if (attrs.shade) badges.push('Ombra');
        if (attrs.electricity) badges.push('Elettricità');
        if (attrs.water) badges.push('Acqua');
        if (attrs.sewer) badges.push('Scarico');
        return badges;
    };

    // Calculate derived state
    const piazzolaCount = results?.pitches.filter(p => p.type === 'piazzola').length || 0;
    const tendaCount = results?.pitches.filter(p => p.type === 'tenda').length || 0;

    const filteredPitches = results?.pitches.filter(p => {
        if (pitchType === 'all') return true;
        return p.type === pitchType;
    }) || [];

    const handleBookingClick = (pitch: Pitch) => {
        setSelectedPitch(pitch);
        setShowBookingModal(true);
    };

    const handleBookingSuccess = () => {
        queryClient.invalidateQueries({ queryKey: ['availability'] });
        setShowBookingModal(false);
        setSelectedPitch(null);
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
                <div className="grid gap-4 md:grid-cols-3 mb-6">
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
                            <h3 className="text-lg font-semibold flex items-center gap-4">
                                <span>Disponibilità:</span>
                                <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200">
                                    {piazzolaCount} Piazzole
                                </Badge>
                                <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                                    {tendaCount} Tende
                                </Badge>
                            </h3>
                        </div>

                        {filteredPitches.length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground border rounded-md">
                                <p>Nessuna disponibilità compatibile con i filtri selezionati</p>
                            </div>
                        ) : (
                            <div className="border rounded-md">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Numero</TableHead>
                                            <TableHead>Tipo</TableHead>
                                            <TableHead>Caratteristiche</TableHead>
                                            <TableHead className="text-right">Azioni</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredPitches.map((pitch) => (
                                            <TableRow key={pitch.id}>
                                                <TableCell className="font-medium">{pitch.number}</TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary">{pitch.type}</Badge>
                                                </TableCell>
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
                                                        onClick={() => handleBookingClick(pitch)}
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

            {/* Booking Modal */}
            {selectedPitch && checkInDate && checkOutDate && (
                <BookingCreationModal
                    open={showBookingModal}
                    onClose={() => setShowBookingModal(false)}
                    pitchNumber={selectedPitch.number}
                    pitchId={selectedPitch.id}
                    pitchType={selectedPitch.type as any} // Cast if needed, or ensure PitchType is compatible
                    checkIn={format(checkInDate, 'yyyy-MM-dd')}
                    checkOut={format(checkOutDate, 'yyyy-MM-dd')}
                    onSuccess={handleBookingSuccess}
                />
            )}
        </Card>
    );
}
