'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Loader2, Check, UserCheck, AlertCircle, Calendar, Users, FileText, Info } from 'lucide-react';
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
                        <Card key={booking.id} className="hover:shadow-md transition-all border-l-4 border-l-primary">
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
                                <Button
                                    size="lg"
                                    variant={booking.status === 'checked_in' ? "secondary" : "default"}
                                    onClick={() => handleOpenCheckIn(booking)}
                                >
                                    {booking.status === 'checked_in' ? (
                                        <>
                                            <Check className="w-4 h-4 mr-2" /> Modifica Dati
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

            {/* Modal Dialog */}
            <CheckInDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen} // Allow clicking outside to close
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

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[95vw] max-w-[95vw] w-full h-[95vh] flex flex-col p-6 gap-0">
                <DialogHeader className="flex-none mb-4">
                    <DialogTitle className="text-3xl flex items-center gap-2">
                        Check-in: {booking.customer?.first_name} {booking.customer?.last_name}
                    </DialogTitle>
                    <DialogDescription className="text-lg">
                        Completa i dati dell'ospite e conferma il check-in.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto pr-2 -mr-2">
                    {/* Info Summary Strip */}
                    <div className="flex flex-wrap gap-4 p-4 bg-muted/30 rounded-lg border text-sm mb-6">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium text-foreground">
                                {format(start, 'd MMM', { locale: it })} - {format(end, 'd MMM yyyy', { locale: it })}
                            </span>
                        </div>
                        <div className="w-px h-auto bg-border mx-2 hidden sm:block"></div>
                        <div className="flex items-center gap-2">
                            <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider">
                                Piazzola {booking.pitch?.number}
                            </span>
                        </div>
                        <div className="w-px h-auto bg-border mx-2 hidden sm:block"></div>
                        <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-muted-foreground" />
                            <span>{booking.guests_count} Ospiti</span>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 pb-4">
                        <div className="space-y-8">
                            {/* Dati di Nascita */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-primary font-semibold border-b pb-2 border-l-4 border-l-primary pl-2 bg-primary/5">
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
                                    <div className="space-y-2">
                                        <Label>Stato Nascita</Label>
                                        <Input placeholder="Italia" value={birthCountry} onChange={e => setBirthCountry(e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Provincia (Sigla)</Label>
                                        <Input placeholder="MI" maxLength={2} className="uppercase" value={birthProvince} onChange={e => setBirthProvince(e.target.value.toUpperCase())} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Comune Nascita</Label>
                                        <Input placeholder="Milano" value={birthCity} onChange={e => setBirthCity(e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Cittadinanza</Label>
                                        <Input placeholder="Italiana" value={citizenship} onChange={e => setCitizenship(e.target.value)} />
                                    </div>
                                </div>
                            </div>

                            {/* Residenza */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-primary font-semibold border-b pb-2 border-l-4 border-l-green-600 pl-2 bg-green-50 dark:bg-green-950/20">
                                    <UserCheck className="w-5 h-5 text-green-600" />
                                    <h3 className="text-lg">Residenza</h3>
                                </div>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Indirizzo (Via/Piazza, Civico)</Label>
                                        <Input placeholder="Via Roma, 1" value={address} onChange={e => setAddress(e.target.value)} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Comune</Label>
                                            <Input placeholder="Roma" value={residenceCity} onChange={e => setResidenceCity(e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>CAP</Label>
                                            <Input placeholder="00100" value={residenceZip} onChange={e => setResidenceZip(e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Provincia</Label>
                                            <Input placeholder="RM" maxLength={2} className="uppercase" value={residenceProvince} onChange={e => setResidenceProvince(e.target.value.toUpperCase())} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Stato</Label>
                                            <Input placeholder="Italia" value={residenceCountry} onChange={e => setResidenceCountry(e.target.value)} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-8">
                            {/* Documento d'Identità */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-primary font-semibold border-b pb-2 border-l-4 border-l-amber-500 pl-2 bg-amber-50 dark:bg-amber-950/20">
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
                                            <Label>Ente Rilascio</Label>
                                            <Input placeholder="Comune di..." value={docIssuer} onChange={e => setDocIssuer(e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Comune Rilascio</Label>
                                            <Input placeholder="Milano" value={docIssueCity} onChange={e => setDocIssueCity(e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Stato Rilascio</Label>
                                            <Input placeholder="Italia" value={docIssueCountry} onChange={e => setDocIssueCountry(e.target.value)} />
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
        </Dialog>
    );
}
