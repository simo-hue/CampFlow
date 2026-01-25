'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Loader2, Check, UserCheck, AlertCircle, Calendar, Users, FileText, ChevronRight, ChevronDown, Plus, Info, Crown } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { toast } from "sonner";
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { cn } from '@/lib/utils';
import { GuestForm, GuestData } from './components/GuestForm';

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
    const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const [statusFilter, setStatusFilter] = useState<'all' | 'checked_in' | 'not_checked_in'>('all');
    const [questuraFilter, setQuesturaFilter] = useState<'all' | 'sent' | 'not_sent'>('all');

    // Fetch bookings on mount
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

    useEffect(() => {
        fetchBookings();
    }, []);

    const handleOpenCheckIn = (booking: any) => {
        setSelectedBooking(booking);
        setIsDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
        setTimeout(() => setSelectedBooking(null), 300); // Clear after animation
    };

    const handleSuccess = () => {
        handleCloseDialog();
        fetchBookings();
    };

    // Filter displayed bookings
    const filteredBookings = bookings.filter((b: any) => {
        // 1. Text Search
        const term = searchTerm.toLowerCase();
        const fullName = `${b.customer?.first_name} ${b.customer?.last_name}`.toLowerCase();
        const matchesSearch = !searchTerm || fullName.includes(term);

        // 2. Status Filter
        let matchesStatus = true;
        if (statusFilter === 'checked_in') {
            matchesStatus = b.status === 'checked_in';
            // 3. Questura Filter (only if checked_in)
            if (matchesStatus && questuraFilter !== 'all') {
                const isSent = b.questura_sent === true;
                if (questuraFilter === 'sent') matchesStatus = isSent;
                if (questuraFilter === 'not_sent') matchesStatus = !isSent;
            }
        } else if (statusFilter === 'not_checked_in') {
            matchesStatus = b.status !== 'checked_in';
        }

        return matchesSearch && matchesStatus;
    });

    return (
        <div className="h-[calc(100vh-4rem)] flex flex-col bg-muted/5 p-0 overflow-hidden">

            {/* Header: Centered & Professional */}
            <div className="flex flex-col items-center justify-center text-center gap-4 shrink-0 py-6 px-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight flex items-center justify-center gap-2">
                        <UserCheck className="h-8 w-8 text-primary" />
                        Check-in Ospiti
                    </h1>
                    <p className="text-muted-foreground text-sm max-w-[500px]">
                        Ricerca prenotazioni, inserisci i documenti d'identità e gestisci gli invii al portale Alloggiati Web.
                    </p>
                </div>

                {/* Main Action Bar: Search & Filters */}
                <div className="flex flex-col md:flex-row w-full max-w-4xl items-stretch md:items-center gap-3 bg-background/60 backdrop-blur-md p-1.5 rounded-xl border shadow-sm mx-auto">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                            placeholder="Cerca prenotazione per nome o cognome..."
                            className="pl-10 h-10 text-sm bg-transparent border-transparent focus-visible:ring-0 placeholder:text-muted-foreground/70"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="h-6 w-[1px] bg-border hidden md:block" />

                    <div className="flex gap-2 w-full md:w-auto">
                        <div className="relative flex-1 md:w-[180px]">
                            <select
                                className="appearance-none flex h-10 w-full rounded-lg bg-muted/50 hover:bg-muted/80 transition-colors px-3 py-2 pr-8 text-sm font-medium focus:outline-none cursor-pointer"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value as any)}
                            >
                                <option value="all">Tutti gli stati</option>
                                <option value="not_checked_in">Da fare</option>
                                <option value="checked_in">Checked-in</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                        </div>

                        {statusFilter === 'checked_in' && (
                            <div className="relative flex-1 md:w-[180px] animate-in fade-in slide-in-from-left-4 duration-300">
                                <select
                                    className="appearance-none flex h-10 w-full rounded-lg bg-muted/50 hover:bg-muted/80 transition-colors px-3 py-2 pr-8 text-sm font-medium focus:outline-none cursor-pointer"
                                    value={questuraFilter}
                                    onChange={(e) => setQuesturaFilter(e.target.value as any)}
                                >
                                    <option value="all">Tutti (Alloggiati)</option>
                                    <option value="not_sent">Da inviare</option>
                                    <option value="sent">Inviati</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 w-full overflow-hidden">
                <div className="h-full flex flex-col pt-0">
                    <div className="flex-1 flex flex-col overflow-hidden">

                        {/* Table Header Row (Sticky) */}
                        <div className="border-b bg-muted/30 px-6 py-3 grid grid-cols-12 gap-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            <div className="col-span-4">Ospite</div>
                            <div className="col-span-4">Soggiorno & Piazzola</div>
                            <div className="col-span-2">Stato</div>
                            <div className="col-span-2 text-right">Azioni</div>
                        </div>

                        {/* Scrollable List */}
                        <ScrollArea className="flex-1">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center h-48 gap-3 text-muted-foreground">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                    <p className="text-sm">Caricamento prenotazioni...</p>
                                </div>
                            ) : filteredBookings.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-64 gap-3 text-muted-foreground">
                                    <Search className="h-12 w-12 opacity-20" />
                                    <p>Nessuna prenotazione trovata.</p>
                                </div>
                            ) : (
                                <div className="divide-y">
                                    {filteredBookings.map((booking) => {
                                        const { start, end } = parseBookingPeriod(booking.booking_period);
                                        const customerName = `${booking.customer?.first_name || ''} ${booking.customer?.last_name || ''}`.trim();
                                        const isCheckedIn = booking.status === 'checked_in';

                                        return (
                                            <div key={booking.id} className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-muted/30 transition-colors group">
                                                {/* Ospite */}
                                                <div className="col-span-4 flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                                                        {booking.customer?.first_name?.[0]}{booking.customer?.last_name?.[0]}
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-foreground group-hover:text-primary transition-colors">
                                                            {customerName || 'Cliente Sconosciuto'}
                                                        </div>
                                                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                                                            <Users className="h-3 w-3" />
                                                            {booking.guests_count} Ospiti
                                                            {booking.notes && (
                                                                <span className="flex items-center gap-1 text-amber-600 dark:text-amber-500 ml-2">
                                                                    <FileText className="h-3 w-3" /> Note
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Soggiorno */}
                                                <div className="col-span-4 space-y-1">
                                                    <div className="flex items-center gap-2 text-sm text-foreground/80">
                                                        <Calendar className="h-3 w-3 text-muted-foreground" />
                                                        {format(start, 'd MMM', { locale: it })} - {format(end, 'd MMM yyyy', { locale: it })}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant="outline" className="text-xs font-normal">
                                                            Piazzola {booking.pitch?.number || '?'}
                                                        </Badge>
                                                    </div>
                                                </div>

                                                {/* Stato */}
                                                <div className="col-span-2">
                                                    <Badge variant={isCheckedIn ? "secondary" : "outline"} className={`font-medium text-xs ${isCheckedIn ? 'bg-green-100 text-green-700 hover:bg-green-100 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800' : ''}`}>
                                                        {isCheckedIn ? 'Checked-in' : 'Confermato'}
                                                    </Badge>
                                                    {isCheckedIn && booking.questura_sent && (
                                                        <div className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                                                            <Check className="h-3 w-3 text-green-600" /> Alloggiati Web
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Azioni */}
                                                <div className="col-span-2 flex justify-end">
                                                    <Button
                                                        variant={isCheckedIn ? "secondary" : "default"}
                                                        size="sm"
                                                        className={`gap-1 shadow-sm transition-all ${!isCheckedIn ? 'hover:bg-primary/90' : 'hover:bg-muted/80'}`}
                                                        onClick={() => handleOpenCheckIn(booking)}
                                                    >
                                                        {isCheckedIn ? (
                                                            <>Dettagli <ChevronRight className="h-3 w-3" /></>
                                                        ) : (
                                                            <>Check-in <ChevronRight className="h-3 w-3" /></>
                                                        )}
                                                    </Button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </ScrollArea>
                    </div>
                </div>
            </div>

            {/* Modal Dialog */}
            <CheckInDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                booking={selectedBooking}
                onClose={handleCloseDialog}
                onSuccess={handleSuccess}
            />
        </div>
    );
}

function CheckInDialog({ open, onOpenChange, booking, onClose, onSuccess }: {
    open: boolean,
    onOpenChange: (open: boolean) => void,
    booking: any,
    onClose: () => void,
    onSuccess: () => void
}) {
    const [sending, setSending] = useState(false);
    const [questuraSent, setQuesturaSent] = useState(false);

    // Guests Management
    const [currentGuestIndex, setCurrentGuestIndex] = useState(0);
    const [guests, setGuests] = useState<GuestData[]>([]);
    const [errors, setErrors] = useState<Record<string, Record<string, boolean>>>({});

    useEffect(() => {
        if (booking) {
            setQuesturaSent(booking.questura_sent || false);

            // Initialize Guests
            let initialGuests: GuestData[] = [];

            if (booking.guests && booking.guests.length > 0) {
                // Use existing guests from DB
                initialGuests = booking.guests.map((g: any) => ({
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
                    address: g.address || (g.is_head_of_family ? booking.customer?.address : '') || '',
                    residence_country: g.residence_country || (g.is_head_of_family ? booking.customer?.residence_country : '') || '',
                    residence_province: g.residence_province || (g.is_head_of_family ? booking.customer?.residence_province : '') || '',
                    residence_city: g.residence_city || (g.is_head_of_family ? booking.customer?.residence_city : '') || '',
                    residence_zip: g.residence_zip || (g.is_head_of_family ? booking.customer?.residence_zip : '') || '',
                    document_type: g.document_type || (g.is_head_of_family ? booking.customer?.document_type : '') || 'carta_identita',
                    document_number: g.document_number || (g.is_head_of_family ? booking.customer?.document_number : '') || '',
                    document_issue_date: g.document_issue_date || (g.is_head_of_family ? booking.customer?.document_issue_date : '') || '',
                    document_issuer: g.document_issuer || (g.is_head_of_family ? booking.customer?.document_issuer : '') || '',
                    document_issue_city: g.document_issue_city || (g.is_head_of_family ? booking.customer?.document_issue_city : '') || '',
                    document_issue_country: g.document_issue_country || (g.is_head_of_family ? booking.customer?.document_issue_country : '') || ''
                }));
            } else {
                // Initialize based on guests_count
                // Logic: 1st guest is Head of Family (Booking Customer)
                const customer = booking.customer || {};

                initialGuests = Array(booking.guests_count).fill(null).map((_, i) => {
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
            if (initialGuests.length < booking.guests_count) {
                const missing = booking.guests_count - initialGuests.length;
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
            // Optional: Truncate if more? Usually shouldn't happen unless logic changed. 
            // Better to keep existing if there are more than expected to avoid data loss.

            setGuests(initialGuests);
            setErrors({});
            setCurrentGuestIndex(0);
        }
    }, [booking, open]);

    const updateGuest = (index: number, data: GuestData) => {
        const newGuests = [...guests];
        newGuests[index] = data;
        setGuests(newGuests);
    };

    const setHeadOfFamily = (index: number) => {
        // Toggle: Set this index to true, others to false
        // WARNING: If switching head, we might lose data if not saved.
        // For simplicity: Copy data from current head to new head if needed? 
        // Or just switch the flag and let the UI react (show more fields).

        let newGuests = guests.map((g, i) => ({
            ...g,
            is_head_of_family: i === index
        }));

        // Ensure the new head has the required fields placeholders if empty
        const customer = booking.customer || {};
        if (newGuests[index].is_head_of_family) {
            const g = newGuests[index];
            // Auto-fill some defaults if missing (e.g. from customer if it matches?)
            // For now, we leave them blank or keep existing values.
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
            // if (!guest.birth_province) guestErrors.birth_province = true; // Optional for foreign?
            if (!guest.birth_city) guestErrors.birth_city = true;
            if (!guest.citizenship) guestErrors.citizenship = true;

            // Head of Family Fields
            if (guest.is_head_of_family) {
                if (!guest.address) guestErrors.address = true;
                if (!guest.residence_city) guestErrors.residence_city = true;
                if (!guest.residence_country) guestErrors.residence_country = true;
                if (!guest.document_number) guestErrors.document_number = true;
                if (!guest.document_issue_date) guestErrors.document_issue_date = true;
                // Add others as needed
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
        if (!validateForm()) {
            toast.error("Controlla i campi obbligatori mancanti");
            return;
        }

        setSending(true);
        try {
            // Find Head of Family to Update Customer Record
            const head = guests.find(g => g.is_head_of_family) || guests[0];

            // 1. Update Customer (Sync Head of Family data back to Customer table)
            if (head) {
                await fetch(`/api/customers/${booking.customer_id}`, {
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
                        document_issue_country: head.document_issue_country
                    })
                });
            }

            // 2. Save ALL Guests to BookingGuests table
            const guestsRes = await fetch(`/api/bookings/${booking.id}/guests`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ guests })
            });

            if (!guestsRes.ok) throw new Error("Errore salvataggio ospiti");

            // 3. Update Booking Status & Questura
            const bookingRes = await fetch(`/api/bookings/${booking.id}`, {
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

    if (!booking) return null;
    const { start, end } = parseBookingPeriod(booking.booking_period);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[95vw] max-w-[95vw] w-full max-h-[95vh] flex flex-col p-6 gap-0">
                <DialogHeader className="flex-none mb-6">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div>
                            <DialogTitle className="text-3xl flex items-center gap-2">
                                Check-in: {booking.customer?.first_name} {booking.customer?.last_name}
                            </DialogTitle>
                            <DialogDescription className="text-lg mt-1">
                                Inserisci i dati di tutti gli ospiti ({guests.length} presenti).
                            </DialogDescription>
                        </div>

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
                                    Piazzola {booking.pitch?.number}
                                </span>
                            </div>
                            <div className="w-px h-4 bg-border hidden sm:block"></div>
                            <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-muted-foreground" />
                                <span>{booking.guests_count} Prenotati</span>
                            </div>
                        </div>
                    </div>
                </DialogHeader>

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
                                        key={currentGuestIndex} // Key ensures remount/animation on switch
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
                                                Il sistema segnerà questi ospiti come "Inviati".
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
            </DialogContent>
        </Dialog>
    );
}
