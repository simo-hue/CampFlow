'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Loader2, Check, UserCheck, AlertCircle, Calendar, Users, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { toast } from "sonner";
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

// Helper to extract dates from PostgreSQL daterange string "[2024-01-01,2024-01-05)"
const parseBookingPeriod = (period: string) => {
    if (!period) return { start: new Date(), end: new Date() };
    try {
        // Remove braces/brackets and split by comma
        const clean = period.replace(/[\[\]\(\)]/g, '');
        const [startStr, endStr] = clean.split(',');
        return {
            start: new Date(startStr),
            end: new Date(endStr)
        };
    } catch (e) {
        return { start: new Date(), end: new Date() };
    }
};

export default function CheckInPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [bookings, setBookings] = useState<any[]>([]);
    // We need to fetch bookings with details. The current API returns `bookings` array.
    // Let's type it properly soon. For now avoiding 'any' explicit usage where possible.
    const [selectedBooking, setSelectedBooking] = useState<any | null>(null);

    // Fetch bookings on mount
    useEffect(() => {
        const fetchBookings = async () => {
            setLoading(true);
            try {
                const res = await fetch('/api/bookings');
                if (!res.ok) throw new Error('Failed to fetch');
                const data = await res.json();
                setBookings(data.bookings || []);
            } catch (error) {
                console.error(error);
                toast.error("Errore caricamento", { description: "Impossibile caricare la lista prenotazioni" });
            } finally {
                setLoading(false);
            }
        };
        fetchBookings();
    }, []);

    // Filter displayed bookings
    const filteredBookings = bookings.filter((b: any) => {
        if (!searchTerm) return true; // Show all if no search
        const term = searchTerm.toLowerCase();
        const fullName = `${b.customer?.first_name} ${b.customer?.last_name}`.toLowerCase();
        return fullName.includes(term);
    });

    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl">
            <h1 className="text-3xl font-bold mb-6">Check-in Ospiti</h1>

            {/* Search Section */}
            <div className="flex gap-4 mb-8">
                <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                        placeholder="Cerca per nome o cognome..."
                        className="text-lg py-6 pl-12"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Results */}
            <div className="space-y-4">
                {filteredBookings.map((booking) => {
                    const { start, end } = parseBookingPeriod(booking.booking_period);
                    const customerName = `${booking.customer?.first_name || ''} ${booking.customer?.last_name || ''}`.trim();

                    return (
                        <Card key={booking.id} className="hover:shadow-md transition-all cursor-pointer border-l-4 border-l-primary" onClick={() => setSelectedBooking(booking)}>
                            <CardContent className="p-6 flex items-center justify-between">
                                <div className="flex items-center gap-6">
                                    <div className="bg-primary/10 p-4 rounded-full">
                                        <UserCheck className="w-8 h-8 text-primary" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <h3 className="text-2xl font-bold">{customerName || 'Cliente Sconosciuto'}</h3>
                                            <Badge variant={booking.status === 'checked_in' ? "secondary" : "outline"} className="text-xs uppercase">
                                                {booking.status === 'checked_in' ? 'Checked-in' : 'Confermato'}
                                            </Badge>
                                        </div>

                                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-2">
                                            <div className="flex items-center gap-1 bg-secondary/30 px-2 py-1 rounded-md">
                                                <span className="font-semibold text-foreground">Piazzola {booking.pitch?.number || '?'}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Calendar className="w-4 h-4" />
                                                <span>{format(start, 'd MMM yyyy', { locale: it })} - {format(end, 'd MMM yyyy', { locale: it })}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Users className="w-4 h-4" />
                                                <span>{booking.guests_count} Ospiti</span>
                                            </div>
                                            {booking.notes && (
                                                <div className="flex items-center gap-1 text-amber-600 dark:text-amber-500">
                                                    <FileText className="w-4 h-4" />
                                                    <span>Note presenti</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <Button size="lg" variant={booking.status === 'checked_in' ? "secondary" : "default"}>
                                    {booking.status === 'checked_in' ? (
                                        <>
                                            <Check className="w-4 h-4 mr-2" /> Gestisci
                                        </>
                                    ) : (
                                        'Effettua Check-in'
                                    )}
                                </Button>
                            </CardContent>
                        </Card>
                    );
                })}

                {filteredBookings.length === 0 && !loading && (
                    <div className="text-center py-20 bg-muted/10 rounded-xl border border-dashed">
                        <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                        <h3 className="text-xl font-semibold text-muted-foreground">Nessuna prenotazione trovata</h3>
                        <p className="text-sm text-muted-foreground mt-2">Prova a cercare un altro nome o controlla i filtri.</p>
                    </div>
                )}
            </div>

            {/* Detail View */}
            {selectedBooking && (
                <CheckInDetailsForm
                    booking={selectedBooking}
                    onClose={() => setSelectedBooking(null)}
                    onSuccess={() => {
                        setSelectedBooking(null);
                        searchBookings(); // Refresh list
                    }}
                />
            )}
        </div>
    );
}

function CheckInDetailsForm({ booking, onClose, onSuccess }: { booking: any, onClose: () => void, onSuccess: () => void }) {
    const [sending, setSending] = useState(false);
    const [questuraSent, setQuesturaSent] = useState(booking.questura_sent || false);

    // Customer Details State
    const [birthDate, setBirthDate] = useState(booking.customer?.birth_date || '');
    const [birthPlace, setBirthPlace] = useState(booking.customer?.birth_place || '');
    const [docType, setDocType] = useState(booking.customer?.document_type || 'carta_identita');
    const [docNumber, setDocNumber] = useState(booking.customer?.document_number || '');

    const handleConfirmCheckIn = async () => {
        setSending(true);
        try {
            // 1. Update Customer Details
            const customerRes = await fetch(`/api/customers/${booking.customer_id}`, {
                method: 'PATCH', // We need to implement/verify this endpoint supports details
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    birth_date: birthDate,
                    birth_place: birthPlace,
                    document_type: docType,
                    document_number: docNumber
                })
            });

            // 2. Update Booking Status & Questura
            const bookingRes = await fetch(`/api/bookings/${booking.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status: 'checked_in',
                    questura_sent: questuraSent
                })
            });

            if (!bookingRes.ok) throw new Error("Errore aggiornamento prenotazione");

            toast.success("Check-in completato con successo!");
            onSuccess();
        } catch (error) {
            console.error(error);
            toast.error("Errore durante il check-in");
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="mt-8 p-6 border rounded-lg bg-card animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-2xl font-bold mb-6">Dettagli Check-in: {booking.customer.full_name}</h2>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
                {/* Dati Documento */}
                <div className="space-y-4 p-4 border rounded-md">
                    <h3 className="font-semibold flex items-center gap-2">
                        <UserCheck className="w-4 h-4" /> Dati Ospite Principale
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <Label>Data di Nascita</Label>
                            <Input type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Luogo di Nascita</Label>
                            <Input placeholder="Città (Prov)" value={birthPlace} onChange={e => setBirthPlace(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Tipo Documento</Label>
                            <Input value={docType} onChange={e => setDocType(e.target.value)} placeholder="es. CI, Passaporto" />
                        </div>
                        <div className="space-y-2">
                            <Label>Numero Documento</Label>
                            <Input value={docNumber} onChange={e => setDocNumber(e.target.value)} />
                        </div>
                    </div>
                </div>

                {/* Questura Switch */}
                <div className="space-y-4 p-4 border rounded-md bg-muted/20">
                    <h3 className="font-semibold flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" /> Adempimenti
                    </h3>
                    <div className="flex items-center space-x-2 pt-4">
                        <Switch
                            id="questura-mode"
                            checked={questuraSent}
                            onCheckedChange={setQuesturaSent}
                        />
                        <Label htmlFor="questura-mode">Dati inviati al portale Alloggiati Web (Questura)</Label>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                        Attiva questo switch dopo aver caricato manualmente il file sul portale della Polizia di Stato.
                    </p>
                </div>
            </div>

            <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={onClose} disabled={sending}>Annulla</Button>
                <Button onClick={handleConfirmCheckIn} disabled={sending} className="min-w-[150px]">
                    {sending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
                    Conferma Check-in
                </Button>
            </div>
        </div>
    );
}
