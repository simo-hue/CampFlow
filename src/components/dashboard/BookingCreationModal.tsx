'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, FileText, Loader2, Check, Dog, Plus, X, Euro, Car, Baby, Info } from 'lucide-react';
import { calculateNights, formatDateLong } from '@/lib/dateUtils';
import { formatCurrency } from '@/lib/utils';
import type { PitchType, PriceBreakdownDay } from '@/lib/types';
import { invalidateOccupancyCache } from '@/lib/occupancyCache';
import { CustomerAutocomplete } from './CustomerAutocomplete';
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface BookingCreationModalProps {
    open: boolean;
    onClose: () => void;
    pitchNumber: string;
    pitchId: string;
    pitchType: PitchType;
    checkIn: string;
    checkOut: string;
    onSuccess: () => void;
}

export function BookingCreationModal({
    open,
    onClose,
    pitchNumber,
    pitchId,
    pitchType,
    checkIn,
    checkOut,
    onSuccess,
}: BookingCreationModalProps) {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [customerEmail, setCustomerEmail] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [licensePlate, setLicensePlate] = useState('');
    const [guestsCount, setGuestsCount] = useState(2);
    const [childrenCount, setChildrenCount] = useState(0);
    const [carsCount, setCarsCount] = useState(0);
    const [dogsCount, setDogsCount] = useState(0);
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [childAgeMax, setChildAgeMax] = useState(12);

    // Autocomplete State
    const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

    const nights = calculateNights(checkIn, checkOut);
    const [totalPrice, setTotalPrice] = useState(0);
    const [priceBreakdown, setPriceBreakdown] = useState<PriceBreakdownDay[]>([]);
    const [loadingPrice, setLoadingPrice] = useState(false);

    // Fetch price from API whenever dates, pitch type, or counts change
    useEffect(() => {
        const fetchPrice = async () => {
            setLoadingPrice(true);
            try {
                let personPrice = 10;
                let dogPrice = 5;
                let childPrice = 5;
                let carPrice = 5;
                let childMaxAge = 12;

                if (typeof window !== 'undefined') {
                    const savedPricing = localStorage.getItem('pricing');
                    if (savedPricing) {
                        const parsed = JSON.parse(savedPricing);
                        personPrice = parsed.person_price_per_day ?? 10;
                        dogPrice = parsed.dog_price_per_day ?? 5;
                        childPrice = parsed.child_price_per_day ?? 5;
                        carPrice = parsed.car_price_per_day ?? 5;
                        childMaxAge = parsed.child_age_max ?? 12;
                    }
                }
                setChildAgeMax(childMaxAge);

                const res = await fetch(
                    `/api/pricing/calculate?checkIn=${checkIn}&checkOut=${checkOut}&pitchType=${pitchType}&guests=${guestsCount}&children=${childrenCount}&dogs=${dogsCount}&cars=${carsCount}&guestPrice=${personPrice}&childPrice=${childPrice}&dogPrice=${dogPrice}&carPrice=${carPrice}&customerId=${selectedCustomerId || ''}`
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
                const fallbackRate = pitchType === "piazzola" ? 25 : 18;
                const days = nights > 0 ? nights : 1;
                setTotalPrice(fallbackRate * days);
            } finally {
                setLoadingPrice(false);
            }
        };

        fetchPrice();
        fetchPrice();
    }, [checkIn, checkOut, pitchType, nights, guestsCount, childrenCount, dogsCount, carsCount, selectedCustomerId]);

    const handleCustomerSelect = (customer: any) => {
        setSelectedCustomerId(customer.id);
        setFirstName(customer.first_name);
        setLastName(customer.last_name);
        setCustomerEmail(customer.email || '');
        setCustomerPhone(customer.phone);
        setLicensePlate(customer.license_plate || '');
        toast.success("Dati cliente caricati");
    };

    const handleManualEdit = (field: 'first' | 'last', value: string) => {
        if (field === 'first') setFirstName(value);
        if (field === 'last') setLastName(value);

        if (selectedCustomerId) {
            setSelectedCustomerId(null);
        }
    };

    const handleCreateBooking = async () => {
        if (!firstName.trim()) {
            toast.error('Dati mancanti', { description: 'Il nome del cliente è obbligatorio' });
            return;
        }
        if (!lastName.trim()) {
            toast.error('Dati mancanti', { description: 'Il cognome del cliente è obbligatorio' });
            return;
        }
        if (!customerPhone.trim()) {
            toast.error('Dati mancanti', { description: 'Il numero di telefono è obbligatorio' });
            return;
        }
        if (guestsCount < 1) {
            toast.error('Errore dati', { description: 'Il numero di ospiti deve essere almeno 1' });
            return;
        }

        setLoading(true);

        try {
            const payload = {
                pitch_id: pitchId,
                check_in: checkIn,
                check_out: checkOut,
                guests_count: guestsCount + childrenCount, // Total people for booking table logic
                children_count: childrenCount, // Store specifically if DB supports checks
                dogs_count: dogsCount,
                cars_count: carsCount, // Store specifically if DB supports checks
                notes: notes,
                customer: {
                    first_name: firstName,
                    last_name: lastName,
                    email: customerEmail || null,
                    phone: customerPhone,
                    notes: notes,
                    license_plate: licensePlate || null
                },
            };

            if (selectedCustomerId) {
                (payload as any).customer_id = selectedCustomerId;
            }

            const bookingRes = await fetch('/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
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
                setSelectedCustomerId(null);
            }, 1000);

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
        setLicensePlate('');
        setGuestsCount(2);
        setChildrenCount(0);
        setCarsCount(0);
        setDogsCount(0);
        setNotes('');
        setSuccess(false);
    };

    const handleClose = () => {
        if (!loading) {
            onClose();
            resetForm();
            setSelectedCustomerId(null);
        }
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
                        <div className="space-y-2">
                            <Label>Cerca o Inserisci Cliente</Label>
                            <CustomerAutocomplete
                                onSelect={handleCustomerSelect}
                                onClear={() => setSelectedCustomerId(null)}
                                selectedCustomerId={selectedCustomerId || undefined}
                            />
                        </div>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground">
                                    Dettagli Anagrafici
                                </span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Cliente *</Label>
                            <div className="grid grid-cols-2 gap-2">
                                <Input
                                    placeholder="Nome"
                                    value={firstName}
                                    onChange={(e) => handleManualEdit('first', e.target.value)}
                                    disabled={loading}
                                />
                                <Input
                                    placeholder="Cognome"
                                    value={lastName}
                                    onChange={(e) => handleManualEdit('last', e.target.value)}
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

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <Label htmlFor="cars" className="flex items-center gap-2">
                                    <Car className="h-4 w-4" />
                                    Auto
                                </Label>
                                <Input
                                    id="cars"
                                    type="number"
                                    min="0"
                                    max="5"
                                    value={carsCount}
                                    onChange={(e) => setCarsCount(parseInt(e.target.value) || 0)}
                                    disabled={loading}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="license_plate">Targa</Label>
                                <Input
                                    id="license_plate"
                                    placeholder="AA000AA"
                                    value={licensePlate}
                                    onChange={(e) => setLicensePlate(e.target.value.toUpperCase())}
                                    disabled={loading}
                                    className="uppercase font-mono"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <Label htmlFor="guests" className="flex items-center gap-2">
                                    <Users className="h-4 w-4" />
                                    Adulti
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
                                <div className="flex items-center gap-2">
                                    <Label htmlFor="children" className="flex items-center gap-2">
                                        <Baby className="h-4 w-4" />
                                        Bambini
                                    </Label>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Età massima: {childAgeMax} anni</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                                <Input
                                    id="children"
                                    type="number"
                                    min="0"
                                    max="10"
                                    value={childrenCount}
                                    onChange={(e) => setChildrenCount(parseInt(e.target.value) || 0)}
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

                {!success && (
                    <div className="pt-4 border-t">
                        <div className="flex justify-between items-center p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2">
                                    <Euro className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                    <span className="font-semibold text-lg">Totale Stimato</span>
                                </div>
                                {priceBreakdown.length > 0 && priceBreakdown[0].seasonName && (
                                    <p className="text-xs text-muted-foreground font-medium ml-7">
                                        Stagione: {priceBreakdown[0].seasonName}
                                    </p>
                                )}
                            </div>
                            <div className="text-right">
                                <span className="font-bold text-2xl text-blue-600 dark:text-blue-400">
                                    {formatCurrency(totalPrice)}
                                </span>
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
        </Dialog >
    );
}
