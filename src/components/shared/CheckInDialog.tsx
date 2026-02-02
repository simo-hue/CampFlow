'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Check, AlertCircle, Calendar, Users, Crown, Info } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { toast } from "sonner";
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { cn } from '@/lib/utils';
import { GuestForm, GuestData } from '@/app/checkin/components/GuestForm';
import { DashboardEvent } from '@/types/dashboard';

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

interface CheckInDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    booking: any; // Full booking object from /api/bookings
    event?: DashboardEvent; // For arrivals page (simplified event data)
    onClose: () => void;
    onSuccess: () => void;
}

export function CheckInDialog({ open, onOpenChange, booking, event, onClose, onSuccess }: CheckInDialogProps) {
    const [sending, setSending] = useState(false);
    const [questuraSent, setQuesturaSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [fullBooking, setFullBooking] = useState<any | null>(null);

    // Guests Management
    const [currentGuestIndex, setCurrentGuestIndex] = useState(0);
    const [guests, setGuests] = useState<GuestData[]>([]);
    const [errors, setErrors] = useState<Record<string, Record<string, boolean>>>({});

    // If we receive an event from arrivals page, we need to fetch the full booking
    useEffect(() => {
        if (open && event && !booking) {
            // Fetch full booking data by event.id
            setLoading(true);
            fetch(`/api/bookings/${event.id}`)
                .then(res => res.json())
                .then(data => {
                    setFullBooking(data.booking || data);
                })
                .catch(err => {
                    console.error('Error fetching booking:', err);
                    toast.error('Errore caricamento prenotazione');
                })
                .finally(() => setLoading(false));
        } else if (booking) {
            setFullBooking(booking);
        }
    }, [open, event, booking]);

    // Current booking data to use
    const currentBooking = fullBooking || booking;

    useEffect(() => {
        if (currentBooking && open) {
            setQuesturaSent(currentBooking.questura_sent || false);

            // Initialize Guests
            let initialGuests: GuestData[] = [];

            if (currentBooking.guests && currentBooking.guests.length > 0) {
                // Use existing guests from DB
                initialGuests = currentBooking.guests.map((g: any) => ({
                    id: g.id,
                    first_name: g.first_name || '',
                    last_name: g.last_name || '',
                    birth_date: g.birth_date || '',
                    gender: g.gender || '',
                    birth_country: g.birth_country || '',
                    birth_province: g.birth_province || '',
                    birth_city: g.birth_city || '',
                    citizenship: g.citizenship || '',
                    is_head_of_family: g.is_head_of_family || false,
                    // Full fields logic (if any)
                    address: g.address || (g.is_head_of_family ? currentBooking.customer?.address : '') || '',
                    residence_country: g.residence_country || (g.is_head_of_family ? currentBooking.customer?.residence_country : '') || '',
                    residence_province: g.residence_province || (g.is_head_of_family ? currentBooking.customer?.residence_province : '') || '',
                    residence_city: g.residence_city || (g.is_head_of_family ? currentBooking.customer?.residence_city : '') || '',
                    residence_zip: g.residence_zip || (g.is_head_of_family ? currentBooking.customer?.residence_zip : '') || '',
                    document_type: g.document_type || (g.is_head_of_family ? currentBooking.customer?.document_type : '') || 'carta_identita',
                    document_number: g.document_number || (g.is_head_of_family ? currentBooking.customer?.document_number : '') || '',
                    document_issue_date: g.document_issue_date || (g.is_head_of_family ? currentBooking.customer?.document_issue_date : '') || '',
                    document_issuer: g.document_issuer || (g.is_head_of_family ? currentBooking.customer?.document_issuer : '') || '',
                    document_issue_city: g.document_issue_city || (g.is_head_of_family ? currentBooking.customer?.document_issue_city : '') || '',
                    document_issue_country: g.document_issue_country || (g.is_head_of_family ? currentBooking.customer?.document_issue_country : '') || '',
                    license_plate: g.license_plate || (g.is_head_of_family ? currentBooking.customer?.license_plate : '') || ''
                }));
            } else {
                // Initialize based on guests_count
                // Logic: 1st guest is Head of Family (Booking Customer)
                const customer = currentBooking.customer || currentBooking.customers || {};

                initialGuests = Array(currentBooking.guests_count).fill(null).map((_, i) => {
                    const isHead = i === 0;
                    if (isHead) {
                        return {
                            first_name: customer.first_name || '',
                            last_name: customer.last_name || '',
                            birth_date: customer.birth_date || '',
                            gender: customer.gender || '',
                            birth_country: customer.birth_country || 'Italia',
                            birth_province: customer.birth_province || '',
                            birth_city: customer.birth_city || '',
                            citizenship: customer.citizenship || 'Italiana',
                            is_head_of_family: true,

                            address: customer.address || '',
                            residence_country: customer.residence_country || 'Italia',
                            residence_province: customer.residence_province || '',
                            residence_city: customer.residence_city || '',
                            residence_zip: customer.residence_zip || '',

                            document_type: customer.document_type || 'carta_identita',
                            document_number: customer.document_number || '',
                            document_issue_date: customer.document_issue_date || '',
                            document_issuer: customer.document_issuer || '',
                            document_issue_city: customer.document_issue_city || '',
                            document_issue_country: customer.document_issue_country || 'Italia',
                            license_plate: customer.license_plate || '',
                        };
                    } else {
                        return {
                            first_name: '',
                            last_name: '',
                            birth_date: '',
                            gender: '',
                            birth_country: 'Italia',
                            birth_province: '',
                            birth_city: '',
                            citizenship: 'Italiana',
                            is_head_of_family: false
                        };
                    }
                });
            }

            // PAD with empty guests if current list is shorter than guests_count
            if (initialGuests.length < currentBooking.guests_count) {
                const missing = currentBooking.guests_count - initialGuests.length;
                for (let i = 0; i < missing; i++) {
                    initialGuests.push({
                        first_name: '',
                        last_name: '',
                        birth_date: '',
                        gender: '',
                        birth_country: 'Italia',
                        birth_province: '',
                        birth_city: '',
                        citizenship: 'Italiana',
                        is_head_of_family: false
                    });
                }
            }

            setGuests(initialGuests);
            setErrors({});
            setCurrentGuestIndex(0);
        }
    }, [currentBooking, open]);

    const updateGuest = (index: number, data: GuestData) => {
        const newGuests = [...guests];
        newGuests[index] = data;
        setGuests(newGuests);
    };

    const setHeadOfFamily = (index: number) => {
        let newGuests = guests.map((g, i) => ({
            ...g,
            is_head_of_family: i === index
        }));

        // Ensure the new head has the required fields placeholders if empty
        if (newGuests[index].is_head_of_family) {
            const g = newGuests[index];
            if (!g.document_type) g.document_type = 'carta_identita';
        }

        setGuests(newGuests);
    };

    const validateForm = () => {
        const newErrors: Record<string, Record<string, boolean>> = {};
        let isValid = true;

        guests.forEach((guest, index) => {
            const guestErrors: Record<string, boolean> = {};

            // Common Fields
            if (!guest.first_name) guestErrors.first_name = true;
            if (!guest.last_name) guestErrors.last_name = true;
            if (!guest.birth_date) guestErrors.birth_date = true;
            if (!guest.gender) guestErrors.gender = true;
            if (!guest.birth_country) guestErrors.birth_country = true;
            if (!guest.birth_city) guestErrors.birth_city = true;
            if (!guest.citizenship) guestErrors.citizenship = true;

            // Head of Family Fields
            if (guest.is_head_of_family) {
                if (!guest.address) guestErrors.address = true;
                if (!guest.residence_city) guestErrors.residence_city = true;
                if (!guest.residence_country) guestErrors.residence_country = true;
                if (!guest.document_number) guestErrors.document_number = true;
                if (!guest.document_issue_date) guestErrors.document_issue_date = true;
            }

            if (Object.keys(guestErrors).length > 0) {
                newErrors[index] = guestErrors;
                isValid = false;
            }
        });

        setErrors(newErrors);
        return isValid;
    };

    const handleConfirmCheckIn = async () => {
        if (!currentBooking) return;

        if (!validateForm()) {
            toast.error("Controlla i campi obbligatori mancanti");
            return;
        }

        setSending(true);
        try {
            // Find Head of Family to Update Customer Record
            const head = guests.find(g => g.is_head_of_family) || guests[0];

            // 1. Update Customer (Sync Head of Family data back to Customer table)
            const customerId = currentBooking.customer_id || currentBooking.customers?.id;
            if (head && customerId) {
                await fetch(`/api/customers/${customerId}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        // Anagrafica
                        first_name: head.first_name,
                        last_name: head.last_name,
                        birth_date: head.birth_date,
                        gender: head.gender,
                        birth_country: head.birth_country,
                        birth_province: head.birth_province,
                        birth_city: head.birth_city,
                        citizenship: head.citizenship,

                        // Residenza
                        address: head.address,
                        residence_city: head.residence_city,
                        residence_zip: head.residence_zip,
                        residence_province: head.residence_province,
                        residence_country: head.residence_country,

                        // Documento
                        document_type: head.document_type,
                        document_number: head.document_number,
                        document_issue_date: head.document_issue_date,
                        document_issuer: head.document_issuer,
                        document_issue_city: head.document_issue_city,
                        document_issue_country: head.document_issue_country,
                        license_plate: head.license_plate
                    })
                });
            }

            // 2. Save ALL Guests to BookingGuests table
            const guestsRes = await fetch(`/api/bookings/${currentBooking.id}/guests`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ guests })
            });

            if (!guestsRes.ok) throw new Error("Errore salvataggio ospiti");

            // 3. Update Booking Status & Questura
            const bookingRes = await fetch(`/api/bookings/${currentBooking.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status: 'checked_in',
                    questura_sent: questuraSent
                })
            });

            if (!bookingRes.ok) throw new Error("Errore aggiornamento stato prenotazione");

            toast.success("Check-in completato con successo!");
            onSuccess();
        } catch (error) {
            console.error(error);
            toast.error("Errore durante il check-in");
        } finally {
            setSending(false);
        }
    };

    if (!currentBooking && !loading) return null;

    // Extract booking period
    const bookingPeriod = currentBooking?.booking_period || event?.booking_period || '';
    const { start, end } = parseBookingPeriod(bookingPeriod);

    // Customer info (support both formats)
    const customer = currentBooking?.customer || currentBooking?.customers || event?.customers || {};
    const customerName = `${customer?.first_name || ''} ${customer?.last_name || ''}`.trim() || 'Ospite';

    // Pitch info
    const pitchNumber = currentBooking?.pitch?.number || event?.pitches?.number || '?';
    const guestsCount = currentBooking?.guests_count || event?.guests_count || guests.length;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[95vw] max-w-[95vw] w-full max-h-[95vh] flex flex-col p-6 gap-0">
                {/* DialogHeader always present for accessibility */}
                <DialogHeader className="flex-none mb-6">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div>
                            <DialogTitle className="text-3xl flex items-center gap-2">
                                {loading ? 'Check-in' : `Check-in: ${customerName}`}
                            </DialogTitle>
                            <DialogDescription className="text-lg mt-1">
                                {loading
                                    ? 'Caricamento dati prenotazione...'
                                    : `Inserisci i dati di tutti gli ospiti (${guests.length} presenti).`
                                }
                            </DialogDescription>
                        </div>

                        {!loading && (
                            <div className="flex flex-wrap items-center gap-3 bg-muted/30 p-2.5 rounded-lg border text-sm shadow-sm mt-8 mr-6 md:mr-0">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-muted-foreground" />
                                    <span className="font-medium text-foreground">
                                        {format(start, 'd MMM', { locale: it })} - {format(end, 'd MMM yyyy', { locale: it })}
                                    </span>
                                </div>
                                <div className="w-px h-4 bg-border hidden sm:block"></div>
                                <div className="flex items-center gap-2">
                                    <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider">
                                        Piazzola {pitchNumber}
                                    </span>
                                </div>
                                <div className="w-px h-4 bg-border hidden sm:block"></div>
                                <div className="flex items-center gap-2">
                                    <Users className="w-4 h-4 text-muted-foreground" />
                                    <span>{guestsCount} Prenotati</span>
                                </div>
                            </div>
                        )}
                    </div>
                </DialogHeader>

                {loading ? (
                    <div className="flex flex-col items-center justify-center h-48 gap-3">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-muted-foreground">Caricamento dati...</p>
                    </div>
                ) : (
                    <>
                        <div className="flex-1 overflow-y-auto pr-2 -mr-2 pb-6">
                            <div className="space-y-6">
                                {/* Guest Tabs Navigation */}
                                <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide shrink-0 bg-muted/20 p-2 rounded-lg border border-border/50">
                                    {guests.map((g, idx) => {
                                        const hasError = errors[idx] && Object.keys(errors[idx]).length > 0;
                                        return (
                                            <button
                                                key={idx}
                                                onClick={() => setCurrentGuestIndex(idx)}
                                                className={cn(
                                                    "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap border h-10",
                                                    currentGuestIndex === idx
                                                        ? "bg-primary text-primary-foreground shadow-sm border-primary"
                                                        : cn(
                                                            "bg-background border-border hover:bg-muted/60",
                                                            g.is_head_of_family ? "text-blue-600 border-blue-200/60 bg-blue-50/20" : "text-muted-foreground"
                                                        ),

                                                    // Error styles
                                                    hasError && currentGuestIndex !== idx && "border-destructive/50 text-destructive/80"
                                                )}
                                            >
                                                <div className={cn(
                                                    "flex items-center justify-center rounded-full w-5 h-5 text-[10px] font-bold transition-colors",
                                                    currentGuestIndex === idx
                                                        ? "bg-primary-foreground/20 text-primary-foreground"
                                                        : (g.is_head_of_family ? "bg-blue-100 text-blue-600" : "bg-muted text-muted-foreground"),
                                                    hasError && "bg-destructive/10 text-destructive"
                                                )}>
                                                    {idx + 1}
                                                </div>
                                                <span>{g.first_name || `Ospite ${idx + 1}`}</span>
                                                {g.is_head_of_family && <Crown className="w-3.5 h-3.5 opacity-70" />}
                                                {hasError && <Info className="w-3 h-3 text-destructive" />}
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Guest Form Area */}
                                <div className="flex-1">
                                    {guests[currentGuestIndex] && (
                                        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                            <GuestForm
                                                key={currentGuestIndex}
                                                index={currentGuestIndex}
                                                guest={guests[currentGuestIndex]}
                                                onChange={updateGuest}
                                                onRemove={undefined}
                                                canRemove={false}
                                                isHeadOfFamily={guests[currentGuestIndex].is_head_of_family}
                                                onSetHeadOfFamily={setHeadOfFamily}
                                                errors={errors[currentGuestIndex]}
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Questura & Adempimenti */}
                                <div className="mt-8 pt-6 border-t">
                                    <div className="flex items-center gap-2 text-primary font-semibold border-b pb-2 mb-4">
                                        <AlertCircle className="w-5 h-5" />
                                        <h3 className="text-lg">Adempimenti Legali</h3>
                                    </div>

                                    <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800 shadow-none">
                                        <CardContent className="pt-6">
                                            <div className="flex items-start space-x-4">
                                                <Switch
                                                    id="questura-mode"
                                                    checked={questuraSent}
                                                    onCheckedChange={setQuesturaSent}
                                                    className="mt-1"
                                                />
                                                <div className="space-y-1">
                                                    <Label htmlFor="questura-mode" className="font-semibold text-base">
                                                        Inviato ad Alloggiati Web
                                                    </Label>
                                                    <p className="text-sm text-muted-foreground leading-snug">
                                                        Abilita questo flag se hai già inviato manualmente i dati al portale della Questura.
                                                        Il sistema segnerà questi ospiti come &quot;Inviati&quot;.
                                                    </p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="pt-4 border-t mt-4 flex justify-between sm:justify-between w-full">
                            <Button variant="outline" onClick={onClose} disabled={sending}>
                                Annulla
                            </Button>
                            <div className="flex gap-2">
                                <Button onClick={handleConfirmCheckIn} disabled={sending} className="min-w-[120px]">
                                    {sending ? <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvataggio...
                                    </> : <>
                                        <Check className="mr-2 h-4 w-4" /> Conferma Check-in
                                    </>}
                                </Button>
                            </div>
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
