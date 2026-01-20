'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Loader2, Check, UserCheck, AlertCircle, Calendar, Users, FileText, Info, ChevronRight, Mail, Phone } from 'lucide-react';
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
import { MunicipalityAutocomplete, ProvinceAutocomplete } from './components/GeoAutocomplete';

import { cn } from '@/lib/utils';

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
                <div className="flex flex-col md:flex-row w-full max-w-2xl items-stretch md:items-center gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Cerca prenotazione per nome o cognome..."
                            className="pl-9 bg-background/50 backdrop-blur-sm border-muted-foreground/20"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="w-full md:w-[180px]">
                        <select
                            className="flex h-10 w-full rounded-md border border-input bg-background/50 backdrop-blur-sm px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as any)}
                        >
                            <option value="all">Tutti</option>
                            <option value="not_checked_in">Da fare</option>
                            <option value="checked_in">Checked-in</option>
                        </select>
                    </div>

                    <div className={cn(
                        "w-full md:w-[180px] transition-all duration-200",
                        statusFilter !== 'checked_in' && "hidden md:flex md:opacity-0 md:invisible md:pointer-events-none"
                    )}>
                        <select
                            className="flex h-10 w-full rounded-md border border-input bg-background/50 backdrop-blur-sm px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            value={questuraFilter}
                            onChange={(e) => setQuesturaFilter(e.target.value as any)}
                        >
                            <option value="all">Tutti (Alloggiati)</option>
                            <option value="not_sent">Da inviare</option>
                            <option value="sent">Inviati</option>
                        </select>
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

    // States initialized when booking changes
    const [questuraSent, setQuesturaSent] = useState(false);

    // Anagrafica
    const [birthDate, setBirthDate] = useState('');
    const [gender, setGender] = useState('');
    const [birthCountry, setBirthCountry] = useState('');
    const [birthProvince, setBirthProvince] = useState('');
    const [birthCity, setBirthCity] = useState('');
    const [citizenship, setCitizenship] = useState('');

    // Residenza
    const [address, setAddress] = useState('');
    const [residenceCity, setResidenceCity] = useState('');
    const [residenceZip, setResidenceZip] = useState('');
    const [residenceProvince, setResidenceProvince] = useState('');
    const [residenceCountry, setResidenceCountry] = useState('');

    // Documento
    const [docType, setDocType] = useState('carta_identita');
    const [docNumber, setDocNumber] = useState('');
    const [docIssueDate, setDocIssueDate] = useState('');
    const [docIssuer, setDocIssuer] = useState('');
    const [docIssueCity, setDocIssueCity] = useState('');
    const [docIssueCountry, setDocIssueCountry] = useState('');

    useEffect(() => {
        if (booking) {
            setQuesturaSent(booking.questura_sent || false);
            const c = booking.customer || {};

            // Anagrafica
            setBirthDate(c.birth_date || '');
            setGender(c.gender || '');
            setBirthCountry(c.birth_country || '');
            setBirthProvince(c.birth_province || '');
            setBirthCity(c.birth_city || '');
            setCitizenship(c.citizenship || '');

            // Residenza
            setAddress(c.address || '');
            setResidenceCity(c.residence_city || '');
            setResidenceZip(c.residence_zip || '');
            setResidenceProvince(c.residence_province || '');
            setResidenceCountry(c.residence_country || '');

            // Documento
            setDocType(c.document_type || 'carta_identita');
            setDocNumber(c.document_number || '');
            setDocIssueDate(c.document_issue_date || '');
            setDocIssuer(c.document_issuer || '');
            setDocIssueCity(c.document_issue_city || '');
            setDocIssueCountry(c.document_issue_country || '');
        }
    }, [booking, open]);

    if (!booking) return null;

    const handleConfirmCheckIn = async () => {
        setSending(true);
        try {
            // 1. Update Customer Details
            await fetch(`/api/customers/${booking.customer_id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    birth_date: birthDate,
                    gender: gender,
                    birth_country: birthCountry,
                    birth_province: birthProvince,
                    birth_city: birthCity,
                    citizenship: citizenship,

                    address: address,
                    residence_city: residenceCity,
                    residence_zip: residenceZip,
                    residence_province: residenceProvince,
                    residence_country: residenceCountry,

                    document_type: docType,
                    document_number: docNumber,
                    document_issue_date: docIssueDate,
                    document_issuer: docIssuer,
                    document_issue_city: docIssueCity,
                    document_issue_country: docIssueCountry
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

    const { start, end } = parseBookingPeriod(booking.booking_period);

    const isItaly = (s: string) => !s || s.toLowerCase() === 'italia';

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
                                Completa i dati dell'ospite e conferma il check-in.
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
                                <span>{booking.guests_count} Ospiti</span>
                            </div>
                        </div>
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto pr-2 -mr-2">
                    <div className="grid md:grid-cols-2 gap-8 pb-4">
                        <div className="space-y-8">
                            {/* Dati di Nascita */}
                            <div className="space-y-4 bg-primary/5 p-4 rounded-xl border border-primary/10">
                                <div className="flex items-center gap-2 text-primary font-semibold border-b pb-2 border-l-4 border-l-primary pl-2">
                                    <UserCheck className="w-5 h-5" />
                                    <h3 className="text-lg">Dati di Nascita</h3>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Data di Nascita</Label>
                                        <Input type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Sesso</Label>
                                        <select
                                            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                            value={gender}
                                            onChange={e => setGender(e.target.value)}
                                        >
                                            <option value="">Seleziona...</option>
                                            <option value="M">Maschio</option>
                                            <option value="F">Femmina</option>
                                        </select>
                                    </div>

                                    {/* Stato Nascita */}
                                    <div className="space-y-2">
                                        <Label>Stato Nascita</Label>
                                        <Input
                                            placeholder="Italia"
                                            value={birthCountry}
                                            onChange={e => setBirthCountry(e.target.value)}
                                        />
                                    </div>

                                    {/* Provincia Nascita */}
                                    <div className="space-y-2">
                                        <Label>Provincia (Sigla)</Label>
                                        {isItaly(birthCountry) ? (
                                            <ProvinceAutocomplete
                                                value={birthProvince}
                                                onSelect={(p) => setBirthProvince(p.sigla)}
                                                placeholder="RM"
                                            />
                                        ) : (
                                            <Input
                                                placeholder="MI"
                                                maxLength={2}
                                                className="uppercase"
                                                value={birthProvince}
                                                onChange={e => setBirthProvince(e.target.value.toUpperCase())}
                                            />
                                        )}
                                    </div>

                                    {/* Comune Nascita */}
                                    <div className="space-y-2">
                                        <Label>Comune Nascita</Label>
                                        {isItaly(birthCountry) ? (
                                            <MunicipalityAutocomplete
                                                value={birthCity}
                                                onSelect={(c) => {
                                                    setBirthCity(c.nome);
                                                    setBirthProvince(c.sigla);
                                                    if (!birthCountry) setBirthCountry("Italia");
                                                }}
                                                placeholder="Cerca comune..."
                                            />
                                        ) : (
                                            <Input
                                                placeholder="Milano"
                                                value={birthCity}
                                                onChange={e => setBirthCity(e.target.value)}
                                            />
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Cittadinanza</Label>
                                        <Input placeholder="Italiana" value={citizenship} onChange={e => setCitizenship(e.target.value)} />
                                    </div>
                                </div>
                            </div>

                            {/* Residenza */}
                            <div className="space-y-4 bg-green-50/50 dark:bg-green-900/10 p-4 rounded-xl border border-green-100 dark:border-green-900/20">
                                <div className="flex items-center gap-2 text-green-700 dark:text-green-500 font-semibold border-b pb-2 border-l-4 border-l-green-600 pl-2">
                                    <UserCheck className="w-5 h-5 text-green-600" />
                                    <h3 className="text-lg">Residenza</h3>
                                </div>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Indirizzo (Via/Piazza, Civico)</Label>
                                        <Input placeholder="Via Roma, 1" value={address} onChange={e => setAddress(e.target.value)} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        {/* Stato Residenza */}
                                        <div className="space-y-2">
                                            <Label>Stato</Label>
                                            <Input
                                                placeholder="Italia"
                                                value={residenceCountry}
                                                onChange={e => setResidenceCountry(e.target.value)}
                                            />
                                        </div>

                                        {/* Comune Residenza */}
                                        <div className="space-y-2">
                                            <Label>Comune</Label>
                                            {isItaly(residenceCountry) ? (
                                                <MunicipalityAutocomplete
                                                    value={residenceCity}
                                                    onSelect={(c) => {
                                                        setResidenceCity(c.nome);
                                                        setResidenceProvince(c.sigla);
                                                        setResidenceZip(c.cap[0] || "");
                                                        if (!residenceCountry) setResidenceCountry("Italia");
                                                    }}
                                                    placeholder="Cerca comune..."
                                                />
                                            ) : (
                                                <Input
                                                    placeholder="Roma"
                                                    value={residenceCity}
                                                    onChange={e => setResidenceCity(e.target.value)}
                                                />
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label>CAP</Label>
                                            <Input placeholder="00100" value={residenceZip} onChange={e => setResidenceZip(e.target.value)} />
                                        </div>

                                        {/* Provincia Residenza */}
                                        <div className="space-y-2">
                                            <Label>Provincia</Label>
                                            {isItaly(residenceCountry) ? (
                                                <ProvinceAutocomplete
                                                    value={residenceProvince}
                                                    onSelect={(p) => setResidenceProvince(p.sigla)}
                                                    placeholder="RM"
                                                />
                                            ) : (
                                                <Input
                                                    placeholder="RM"
                                                    maxLength={2}
                                                    className="uppercase"
                                                    value={residenceProvince}
                                                    onChange={e => setResidenceProvince(e.target.value.toUpperCase())}
                                                />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-8">
                            {/* Documento d'Identità */}
                            <div className="space-y-4 bg-amber-50/50 dark:bg-amber-900/10 p-4 rounded-xl border border-amber-100 dark:border-amber-900/20">
                                <div className="flex items-center gap-2 text-amber-700 dark:text-amber-500 font-semibold border-b pb-2 border-l-4 border-l-amber-500 pl-2">
                                    <UserCheck className="w-5 h-5 text-amber-600" />
                                    <h3 className="text-lg">Documento d'Identità</h3>
                                </div>

                                <div className="grid gap-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Tipo Documento</Label>
                                            <select
                                                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                value={docType}
                                                onChange={e => setDocType(e.target.value)}
                                            >
                                                <option value="carta_identita">Carta d'Identità</option>
                                                <option value="passaporto">Passaporto</option>
                                                <option value="patente">Patente</option>
                                                <option value="altro">Altro</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Numero Documento</Label>
                                            <Input value={docNumber} onChange={e => setDocNumber(e.target.value)} placeholder="AX1234567" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Data Rilascio</Label>
                                            <Input type="date" value={docIssueDate} onChange={e => setDocIssueDate(e.target.value)} />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Stato Rilascio</Label>
                                            <Input placeholder="Italia" value={docIssueCountry} onChange={e => setDocIssueCountry(e.target.value)} />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Comune Rilascio</Label>
                                            {isItaly(docIssueCountry) ? (
                                                <MunicipalityAutocomplete
                                                    value={docIssueCity}
                                                    onSelect={(c) => {
                                                        setDocIssueCity(c.nome);
                                                        if (!docIssueCountry) setDocIssueCountry("Italia");
                                                    }}
                                                    placeholder="Cerca comune..."
                                                />
                                            ) : (
                                                <Input
                                                    placeholder="Milano"
                                                    value={docIssueCity}
                                                    onChange={e => setDocIssueCity(e.target.value)}
                                                />
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Ente Rilascio</Label>
                                            <Input placeholder="Comune di..." value={docIssuer} onChange={e => setDocIssuer(e.target.value)} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Questura & Adempimenti */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-primary font-semibold border-b pb-2">
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
                                                    Conferma di aver generato ed inviato il file delle presenze al portale della Polizia di Stato (Questura).
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg flex gap-3 text-sm text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-900">
                                    <Info className="w-5 h-5 shrink-0 mt-0.5" />
                                    <p>
                                        Ricorda di far firmare il modulo sulla privacy e di verificare la validità dei documenti degli ospiti aggiuntivi se necessario.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter className="mt-4 flex-none border-t pt-4">
                    <Button variant="ghost" size="lg" onClick={onClose} disabled={sending}>
                        Annulla
                    </Button>
                    <div className="flex gap-3 w-full sm:w-auto">
                        <Button
                            onClick={handleConfirmCheckIn}
                            disabled={sending}
                            size="lg"
                            className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white shadow-sm"
                        >
                            {sending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
                            {booking.status === 'checked_in' ? 'Aggiorna Dati' : 'Conferma Check-in'}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog >
    );
}
