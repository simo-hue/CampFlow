'use client';

import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Loader2,
    User,
    Calendar,
    Tent,
    Users,
    Phone,
    Mail,
    MapPin,
    FileText
} from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

interface BookingDetailsDialogProps {
    bookingId: string | null;
    open: boolean;
    onClose: () => void;
}

export function BookingDetailsDialog({ bookingId, open, onClose }: BookingDetailsDialogProps) {
    const [booking, setBooking] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (open && bookingId) {
            setLoading(true);
            setError(null);
            fetch(`/api/bookings/${bookingId}`)
                .then(res => {
                    if (!res.ok) throw new Error("Errore nel caricamento");
                    return res.json();
                })
                .then(data => setBooking(data))
                .catch(err => {
                    console.error(err);
                    setError("Impossibile caricare i dettagli della prenotazione");
                })
                .finally(() => setLoading(false));
        } else {
            setBooking(null);
        }
    }, [open, bookingId]);

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '-';
        return format(new Date(dateStr), 'dd MMMM yyyy', { locale: it });
    };

    const periodMatch = booking?.booking_period?.match(/\[([^,]+),([^\)]+)\)/);
    const checkIn = periodMatch ? periodMatch[1] : null;
    const checkOut = periodMatch ? periodMatch[2] : null;

    return (
        <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Dettagli Prenotazione</DialogTitle>
                    <DialogDescription>
                        Informazioni complete sulla prenotazione selezionata.
                    </DialogDescription>
                </DialogHeader>

                {loading ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : error ? (
                    <div className="p-4 text-center text-red-500 bg-red-50 rounded-md">
                        {error}
                    </div>
                ) : booking ? (
                    <div className="space-y-6">
                        {/* Header Status */}
                        <div className="flex items-center justify-between">
                            <Badge variant={booking.status === 'confirmed' ? 'default' : 'secondary'} className="uppercase">
                                {booking.status === 'confirmed' ? 'Confermata' : booking.status}
                            </Badge>
                            <span className="text-sm text-muted-foreground font-mono">
                                #{booking.id.slice(0, 8)}
                            </span>
                        </div>

                        {/* Main Info Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <h4 className="text-xs font-medium text-muted-foreground uppercase flex items-center gap-1">
                                    <Calendar className="w-3 h-3" /> Check-in
                                </h4>
                                <p className="font-semibold">{formatDate(checkIn)}</p>
                            </div>
                            <div className="space-y-1">
                                <h4 className="text-xs font-medium text-muted-foreground uppercase flex items-center gap-1">
                                    <Calendar className="w-3 h-3" /> Check-out
                                </h4>
                                <p className="font-semibold">{formatDate(checkOut)}</p>
                            </div>
                            <div className="space-y-1">
                                <h4 className="text-xs font-medium text-muted-foreground uppercase flex items-center gap-1">
                                    <Tent className="w-3 h-3" /> Piazzola
                                </h4>
                                <p className="font-medium">
                                    {booking.pitch?.number || "N/A"}
                                    <span className="text-xs text-muted-foreground ml-1">
                                        ({booking.pitch?.type})
                                    </span>
                                </p>
                            </div>
                            <div className="space-y-1">
                                <h4 className="text-xs font-medium text-muted-foreground uppercase flex items-center gap-1">
                                    <Users className="w-3 h-3" /> Ospiti
                                </h4>
                                <p className="font-medium">{booking.guests_count}</p>
                            </div>
                        </div>

                        <div className="border-t pt-4 space-y-3">
                            <h3 className="font-semibold flex items-center gap-2">
                                <User className="w-4 h-4 text-blue-500" />
                                Cliente
                            </h3>
                            <div className="bg-muted/30 p-3 rounded-lg space-y-2 text-sm">
                                <p className="font-medium text-base">
                                    {booking.customer?.first_name} {booking.customer?.last_name}
                                </p>
                                {booking.customer?.phone && (
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Phone className="w-3 h-3" />
                                        {booking.customer.phone}
                                    </div>
                                )}
                                {booking.customer?.email && (
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Mail className="w-3 h-3" />
                                        {booking.customer.email}
                                    </div>
                                )}
                                {booking.customer?.address && (
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <MapPin className="w-3 h-3" />
                                        {booking.customer.address}
                                    </div>
                                )}
                            </div>
                        </div>

                        {booking.notes && (
                            <div className="border-t pt-4 space-y-2">
                                <h4 className="text-sm font-medium flex items-center gap-2">
                                    <FileText className="w-4 h-4" /> Note
                                </h4>
                                <p className="text-sm text-muted-foreground bg-yellow-50 dark:bg-yellow-900/10 p-2 rounded">
                                    {booking.notes}
                                </p>
                            </div>
                        )}

                        {booking.guests && booking.guests.length > 0 && (
                            <div className="border-t pt-4 space-y-2">
                                <h4 className="text-sm font-medium">Ospiti Registrati</h4>
                                <ul className="text-sm list-disc list-inside text-muted-foreground">
                                    {booking.guests.map((g: any) => (
                                        <li key={g.id}>{g.full_name}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <div className="pt-4 flex justify-end gap-2">
                            <Button variant="outline" onClick={onClose}>Chiudi</Button>
                            {/* Potential link to full check-in page */}
                            {/* <Button>Check-in</Button> */}
                        </div>
                    </div>
                ) : null}
            </DialogContent>
        </Dialog>
    );
}
