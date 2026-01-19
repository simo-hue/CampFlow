'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, FileText, Loader2, Check, Dog, Plus, X, Euro } from 'lucide-react';
import { calculateNights, formatDateLong } from '@/lib/dateUtils';
import type { PitchType, PriceBreakdownDay } from '@/lib/types';
import { invalidateOccupancyCache } from './SectorOccupancyViewer';
import { toast } from "sonner";

interface BookingCreationModalProps {
    open: boolean;
    onClose: () => void;
    pitchNumber: string;
    pitchId: string;
    pitchType: PitchType; // NEW
    checkIn: string;
    checkOut: string;
    onSuccess: () => void;
}

export function BookingCreationModal({
    open,
    onClose,
    pitchNumber,
    pitchId,
    pitchType, // NEW
    checkIn,
    checkOut,
    onSuccess,
}: BookingCreationModalProps) {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [customerEmail, setCustomerEmail] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [guestsCount, setGuestsCount] = useState(2);
    const [guestNames, setGuestNames] = useState<string[]>(['']); // At least one guest
    const [dogsCount, setDogsCount] = useState(0);
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    // Detailed Customer Info State
    const [birthDate, setBirthDate] = useState('');
    const [birthCountry, setBirthCountry] = useState('');
    const [birthCity, setBirthCity] = useState('');
    const [birthProvince, setBirthProvince] = useState('');
    const [citizenship, setCitizenship] = useState('');
    const [gender, setGender] = useState('M'); // Default to M

    const [residenceAddress, setResidenceAddress] = useState(''); // Street/Number
    const [residenceCity, setResidenceCity] = useState('');
    const [residenceProvince, setResidenceProvince] = useState('');
    const [residenceCountry, setResidenceCountry] = useState('Italia');
    const [residenceZip, setResidenceZip] = useState('');

    const [docType, setDocType] = useState('carta_identita');
    const [docNumber, setDocNumber] = useState('');
    const [docIssueCity, setDocIssueCity] = useState('');
    const [docIssueCountry, setDocIssueCountry] = useState('Italia');
    const [docIssueDate, setDocIssueDate] = useState('');
    const [docIssuer, setDocIssuer] = useState('');


    const nights = calculateNights(checkIn, checkOut);
    const [totalPrice, setTotalPrice] = useState(0);
    const [priceBreakdown, setPriceBreakdown] = useState<PriceBreakdownDay[]>([]);
    const [loadingPrice, setLoadingPrice] = useState(false);

    // Fetch price from API whenever dates or pitch type change
    useEffect(() => {
        const fetchPrice = async () => {
            setLoadingPrice(true);
            try {
                const res = await fetch(
                    `/api/pricing/calculate?checkIn=${checkIn}&checkOut=${checkOut}&pitchType=${pitchType}`
                );

                if (!res.ok) throw new Error("Failed to calculate price");

                const data = await res.json();
                setTotalPrice(data.totalPrice || 0);
                setPriceBreakdown(data.breakdown || []);
            } catch (error) {
                console.error("Price calculation error:", error);
                toast.error("Errore calcolo prezzo", {
                    description: "Usando tariffa predefinita"
                });
                // Fallback price
                const fallbackRate = pitchType === "piazzola" ? 25 : 18;
                const days = nights > 0 ? nights : 1;
                setTotalPrice(fallbackRate * days);
            } finally {
                setLoadingPrice(false);
            }
        };

        fetchPrice();
    }, [checkIn, checkOut, pitchType, nights]);

    const handleCreateBooking = async () => {
        if (!firstName.trim() || !lastName.trim()) {
            toast.error('Dati mancanti', { description: 'Inserisci nome e cognome del cliente' });
            return;
        }

        setLoading(true);

        try {
            // Step 1: Create or find customer
            let customerId: string;

            if (customerEmail) {
                const searchRes = await fetch(`/api/search?q=${encodeURIComponent(customerEmail)}&type=customers`);
                const searchData = await searchRes.json();

                if (searchData.customers?.length > 0) {
                    customerId = searchData.customers[0].id;
                } else {
                    const customerRes = await fetch('/api/customers', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            first_name: firstName,
                            last_name: lastName,
                            email: customerEmail || null,
                            phone: customerPhone || null,
                            // Detailed fields
                            birth_date: birthDate || null,
                            birth_country: birthCountry || null,
                            birth_city: birthCity || null,
                            birth_province: birthProvince || null,
                            citizenship: citizenship || null,
                            gender: gender,
                            address: residenceAddress || null,
                            residence_city: residenceCity || null,
                            residence_province: residenceProvince || null,
                            residence_country: residenceCountry || null,
                            residence_zip: residenceZip || null,
                            document_type: docType || null,
                            document_number: docNumber || null,
                            document_issue_city: docIssueCity || null,
                            document_issue_country: docIssueCountry || null,
                            document_issue_date: docIssueDate || null,
                            document_issuer: docIssuer || null,
                        }),
                    });

                    if (!customerRes.ok) throw new Error('Failed to create customer');
                    const customerData = await customerRes.json();
                    customerId = customerData.id;
                }
            } else {
                const customerRes = await fetch('/api/customers', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        first_name: firstName,
                        last_name: lastName,
                        email: null,
                        phone: customerPhone || null,
                        // Detailed fields (same as above)
                        birth_date: birthDate || null,
                        birth_country: birthCountry || null,
                        birth_city: birthCity || null,
                        birth_province: birthProvince || null,
                        citizenship: citizenship || null,
                        gender: gender,
                        address: residenceAddress || null,
                        residence_city: residenceCity || null,
                        residence_province: residenceProvince || null,
                        residence_country: residenceCountry || null,
                        residence_zip: residenceZip || null,
                        document_type: docType || null,
                        document_number: docNumber || null,
                        document_issue_city: docIssueCity || null,
                        document_issue_country: docIssueCountry || null,
                        document_issue_date: docIssueDate || null,
                        document_issuer: docIssuer || null,
                    }),
                });

                if (!customerRes.ok) throw new Error('Failed to create customer');
                const customerData = await customerRes.json();
                customerId = customerData.id;
            }

            // Step 2: Create booking
            const bookingRes = await fetch('/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customer_id: customerId,
                    pitch_id: pitchId,
                    check_in: checkIn,
                    check_out: checkOut,
                    guests_count: guestsCount,
                    dogs_count: dogsCount,
                    guest_names: guestNames.filter(name => name.trim()), // Only non-empty names
                    notes: notes || null,
                }),
            });

            if (!bookingRes.ok) {
                const error = await bookingRes.json();
                throw new Error(error.error || 'Failed to create booking');
            }

            setSuccess(true);
            invalidateOccupancyCache();

            setTimeout(() => {
                onSuccess();
                onClose();
                resetForm();
            }, 1500);

        } catch (error) {
            console.error('Error creating booking:', error);
            toast.error("Errore prenotazione", { description: error instanceof Error ? error.message : "Errore durante la creazione della prenotazione" });
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFirstName('');
        setLastName('');
        setCustomerEmail('');
        setCustomerPhone('');
        setGuestsCount(2);
        setGuestNames(['']);
        setDogsCount(0);
        setNotes('');
        setNotes('');
        setSuccess(false);

        // Reset details
        setBirthDate('');
        setBirthCountry('');
        setBirthCity('');
        setBirthProvince('');
        setCitizenship('');
        setGender('M');
        setResidenceAddress('');
        setResidenceCity('');
        setResidenceProvince('');
        setResidenceCountry('Italia');
        setResidenceZip('');
        setDocType('carta_identita');
        setDocNumber('');
        setDocIssueCity('');
        setDocIssueCountry('Italia');
        setDocIssueDate('');
        setDocIssuer('');
    };

    const handleClose = () => {
        if (!loading) {
            onClose();
            resetForm();
        }
    };

    const addGuestField = () => {
        if (guestNames.length < guestsCount) {
            setGuestNames([...guestNames, '']);
        }
    };

    const removeGuestField = (index: number) => {
        setGuestNames(guestNames.filter((_, i) => i !== index));
    };

    const updateGuestName = (index: number, value: string) => {
        const updated = [...guestNames];
        updated[index] = value;
        setGuestNames(updated);
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Nuova Prenotazione - Piazzola {pitchNumber}
                    </DialogTitle>
                    <DialogDescription>
                        <span className="flex items-center gap-2 mt-2">
                            <Badge variant="secondary">
                                {formatDateLong(checkIn)} → {formatDateLong(checkOut)}
                            </Badge>
                            <Badge variant="outline">
                                {nights === 0 ? "1 giorno" : `${nights} ${nights === 1 ? "notte" : "notti"}`}
                            </Badge>
                        </span>
                    </DialogDescription>
                </DialogHeader>

                {success ? (
                    <div className="py-8 text-center">
                        <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                            <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">Prenotazione Creata!</h3>
                        <p className="text-sm text-muted-foreground">
                            La prenotazione è stata salvata con successo.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4 py-4">
                        {/* Customer Name */}
                        <div className="space-y-2">
                            <Label>Cliente *</Label>
                            <div className="grid grid-cols-2 gap-2">
                                <Input
                                    placeholder="Nome"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    disabled={loading}
                                />
                                <Input
                                    placeholder="Cognome"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <Label htmlFor="customer-email">Email</Label>
                                <Input
                                    id="customer-email"
                                    type="email"
                                    placeholder="mario@example.com"
                                    value={customerEmail}
                                    onChange={(e) => setCustomerEmail(e.target.value)}
                                    disabled={loading}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="customer-phone">Telefono</Label>
                                <Input
                                    id="customer-phone"
                                    type="tel"
                                    placeholder="+39 123 456..."
                                    value={customerPhone}
                                    onChange={(e) => setCustomerPhone(e.target.value)}
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        {/* --- NEW SECTIONS --- */}
                        <div className="border rounded-md p-3 space-y-3 bg-slate-50 dark:bg-slate-900/50">
                            <h4 className="font-semibold text-sm flex items-center gap-2">
                                <span className="w-1 h-4 bg-blue-500 rounded-full"></span>
                                Dati di Nascita
                            </h4>
                            <div className="grid grid-cols-2 gap-2">
                                <Input placeholder="Data Nascita" type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)} disabled={loading} />
                                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={gender} onChange={e => setGender(e.target.value)} disabled={loading}
                                >
                                    <option value="M">Maschio</option>
                                    <option value="F">Femmina</option>
                                    <option value="Other">Altro</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <Input placeholder="Stato Nascita" value={birthCountry} onChange={e => setBirthCountry(e.target.value)} disabled={loading} />
                                <Input placeholder="Provincia (Sigla)" maxLength={2} value={birthProvince} onChange={e => setBirthProvince(e.target.value.toUpperCase())} disabled={loading} />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <Input placeholder="Comune Nascita" value={birthCity} onChange={e => setBirthCity(e.target.value)} disabled={loading} />
                                <Input placeholder="Cittadinanza" value={citizenship} onChange={e => setCitizenship(e.target.value)} disabled={loading} />
                            </div>
                        </div>

                        <div className="border rounded-md p-3 space-y-3 bg-slate-50 dark:bg-slate-900/50">
                            <h4 className="font-semibold text-sm flex items-center gap-2">
                                <span className="w-1 h-4 bg-green-500 rounded-full"></span>
                                Residenza
                            </h4>
                            <Input placeholder="Indirizzo (Via/Piazza, Civico)" value={residenceAddress} onChange={e => setResidenceAddress(e.target.value)} disabled={loading} />
                            <div className="grid grid-cols-2 gap-2">
                                <Input placeholder="Comune" value={residenceCity} onChange={e => setResidenceCity(e.target.value)} disabled={loading} />
                                <Input placeholder="CAP" value={residenceZip} onChange={e => setResidenceZip(e.target.value)} disabled={loading} />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <Input placeholder="Provincia" maxLength={2} value={residenceProvince} onChange={e => setResidenceProvince(e.target.value.toUpperCase())} disabled={loading} />
                                <Input placeholder="Stato" value={residenceCountry} onChange={e => setResidenceCountry(e.target.value)} disabled={loading} />
                            </div>
                        </div>

                        <div className="border rounded-md p-3 space-y-3 bg-slate-50 dark:bg-slate-900/50">
                            <h4 className="font-semibold text-sm flex items-center gap-2">
                                <span className="w-1 h-4 bg-yellow-500 rounded-full"></span>
                                Documento d'Identità
                            </h4>
                            <div className="grid grid-cols-2 gap-2">
                                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={docType} onChange={e => setDocType(e.target.value)} disabled={loading}
                                >
                                    <option value="carta_identita">Carta d'Identità</option>
                                    <option value="passaporto">Passaporto</option>
                                    <option value="patente">Patente</option>
                                    <option value="altro">Altro</option>
                                </select>
                                <Input placeholder="Numero Documento" value={docNumber} onChange={e => setDocNumber(e.target.value)} disabled={loading} />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <Input placeholder="Data Rilascio" type="date" value={docIssueDate} onChange={e => setDocIssueDate(e.target.value)} disabled={loading} />
                                <Input placeholder="Ente Rilascio" value={docIssuer} onChange={e => setDocIssuer(e.target.value)} disabled={loading} />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <Input placeholder="Comune Rilascio" value={docIssueCity} onChange={e => setDocIssueCity(e.target.value)} disabled={loading} />
                                <Input placeholder="Stato Rilascio" value={docIssueCountry} onChange={e => setDocIssueCountry(e.target.value)} disabled={loading} />
                            </div>
                        </div>

                        {/* Guests Count and Dogs */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <Label htmlFor="guests" className="flex items-center gap-2">
                                    <Users className="h-4 w-4" />
                                    Ospiti
                                </Label>
                                <Input
                                    id="guests"
                                    type="number"
                                    min="1"
                                    max="10"
                                    value={guestsCount}
                                    onChange={(e) => setGuestsCount(parseInt(e.target.value) || 1)}
                                    disabled={loading}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="dogs" className="flex items-center gap-2">
                                    <Dog className="h-4 w-4" />
                                    Cani
                                </Label>
                                <Input
                                    id="dogs"
                                    type="number"
                                    min="0"
                                    max="5"
                                    value={dogsCount}
                                    onChange={(e) => setDogsCount(parseInt(e.target.value) || 0)}
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        {/* Guest Names (Optional) */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label className="text-sm text-muted-foreground">
                                    Nomi Ospiti (opzionale - compilare al check-in)
                                </Label>
                                {guestNames.length < guestsCount && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={addGuestField}
                                        disabled={loading}
                                    >
                                        <Plus className="h-3 w-3 mr-1" />
                                        Aggiungi
                                    </Button>
                                )}
                            </div>
                            <div className="space-y-2">
                                {guestNames.map((name, index) => (
                                    <div key={index} className="flex gap-2">
                                        <Input
                                            placeholder={`Ospite ${index + 1}`}
                                            value={name}
                                            onChange={(e) => updateGuestName(index, e.target.value)}
                                            disabled={loading}
                                        />
                                        {guestNames.length > 1 && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => removeGuestField(index)}
                                                disabled={loading}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Notes */}
                        <div className="space-y-2">
                            <Label htmlFor="notes" className="flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                Note (opzionale)
                            </Label>
                            <Textarea
                                id="notes"
                                placeholder="Note aggiuntive sulla prenotazione..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                disabled={loading}
                                rows={3}
                            />
                        </div>
                    </div>
                )}


                {/* Total Price Display */}
                {!success && (
                    <div className="pt-4 border-t">
                        <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                            <div className="flex items-center gap-2">
                                <Euro className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                <span className="font-semibold text-lg">Totale</span>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                    €{totalPrice.toFixed(2)}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    {nights === 0 ? "1 giorno" : `${nights} ${nights === 1 ? "notte" : "notti"}`}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {!success && (
                    <DialogFooter>
                        <Button variant="outline" onClick={handleClose} disabled={loading}>
                            Annulla
                        </Button>
                        <Button onClick={handleCreateBooking} disabled={!firstName.trim() || !lastName.trim() || loading}>
                            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            Crea Prenotazione
                        </Button>
                    </DialogFooter>
                )}
            </DialogContent>
        </Dialog>
    );
}
