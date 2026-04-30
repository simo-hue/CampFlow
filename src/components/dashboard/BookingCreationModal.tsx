'use client';
import { logger } from '@/lib/logger';

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
    bookingId?: string;
    initialData?: any;
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
    bookingId,
    initialData
}: BookingCreationModalProps) {
    const isEditMode = !!bookingId;
    // Booking states
    const [checkInState, setCheckInState] = useState(checkIn);
    const [checkOutState, setCheckOutState] = useState(checkOut);
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
    
    // Pitch selection state (for edit mode)
    const [currentPitchId, setCurrentPitchId] = useState(pitchId);
    const [allPitches, setAllPitches] = useState<any[]>([]);
    const [loadingPitches, setLoadingPitches] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [childAgeMax, setChildAgeMax] = useState(12);

    // Autocomplete State
    const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

    // Initialize state from initialData
    useEffect(() => {
        if (open && initialData) {
            const periodMatch = initialData.booking_period?.match(/\[([^,]+),([^\)]+)\)/);
            if (periodMatch) {
                setCheckInState(periodMatch[1]);
                setCheckOutState(periodMatch[2]);
            }
            setFirstName(initialData.customer?.first_name || '');
            setLastName(initialData.customer?.last_name || '');
            setCustomerEmail(initialData.customer?.email || '');
            setCustomerPhone(initialData.customer?.phone || '');
            setLicensePlate(initialData.customer?.license_plate || '');
            setGuestsCount(initialData.guests_count || 2);
            setChildrenCount(initialData.children_count || 0);
            setCarsCount(initialData.cars_count || 0);
            setDogsCount(initialData.dogs_count || 0);
            setNotes(initialData.notes || '');
            setSelectedCustomerId(initialData.customer_id || null);
            setCurrentPitchId(initialData.pitch_id || pitchId);
        } else if (open && !isEditMode) {
            resetForm();
            setCheckInState(checkIn);
            setCheckOutState(checkOut);
            setCurrentPitchId(pitchId);
        }
    }, [open, initialData, isEditMode, pitchId, checkIn, checkOut]);

    // Fetch available pitches for reassignment
    useEffect(() => {
        if (open && isEditMode) {
            setLoadingPitches(true);
            const params = new URLSearchParams({
                check_in: checkInState,
                check_out: checkOutState,
                exclude_booking_id: bookingId || ''
            });
            
            fetch(`/api/availability?${params.toString()}`)
                .then(res => res.json())
                .then(data => {
                    const pitches = data.pitches || [];
                    setAllPitches(pitches);
                    
                    // If current pitch is not in the list (e.g. status changed or other), 
                    // and we haven't changed pitch yet, keep it.
                    // But usually exclude_booking_id handles the occupancy check.
                })
                .catch(err => logger.error("Error fetching available pitches:", { error: err }))
                .finally(() => setLoadingPitches(false));
        }
    }, [open, isEditMode, checkInState, checkOutState, bookingId]);

    const nights = calculateNights(checkInState, checkOutState);

    // Pricing State

    const [totalPrice, setTotalPrice] = useState(0);
    const [priceBreakdown, setPriceBreakdown] = useState<PriceBreakdownDay[]>([]);
    const [loadingPrice, setLoadingPrice] = useState(false);

    // Customer Groups State
    const [customerGroups, setCustomerGroups] = useState<any[]>([]);
    const [selectedGroupId, setSelectedGroupId] = useState<string>('none');

    // Fetch customer groups
    useEffect(() => {
        async function fetchGroups() {
            try {
                const res = await fetch('/api/groups');
                if (res.ok) {
                    const data = await res.json();
                    setCustomerGroups(data.groups || []);
                }
            } catch (error) {
                logger.error("Failed to fetch customer groups", { error });
            }
        }
        fetchGroups();
    }, []);

    // Update selected group if customer changes
    useEffect(() => {
        if (selectedCustomerId) {
            // Fetch customer details to get group? 
            // Better: CustomerAutocomplete could return group_id. 
            // For now, if we select a customer, we might want to respect their existing group 
            // or allow override? 
            // The Pricing API now handles `customerId` lookup internally, so `selectedCustomerId` 
            // ensures the group is used. 
            // But if we want to show it in UI? 
            // Let's rely on manual override only for NEW/Anonymous customers or explicit change.
        }
    }, [selectedCustomerId]);

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
                    `/api/pricing/calculate?checkIn=${checkInState}&checkOut=${checkOutState}&pitchType=${pitchType}&guests=${guestsCount}&children=${childrenCount}&dogs=${dogsCount}&cars=${carsCount}&guestPrice=${personPrice}&childPrice=${childPrice}&dogPrice=${dogPrice}&carPrice=${carPrice}&customerId=${selectedCustomerId || ''}&groupId=${selectedGroupId}`

                );

                if (!res.ok) throw new Error("Failed to calculate price");

                const data = await res.json();
                setTotalPrice(data.totalPrice || 0);
                setPriceBreakdown(data.breakdown || []);
            } catch (error) {
                logger.error("Price calculation error:", { error });
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
    }, [checkInState, checkOutState, pitchType, nights, guestsCount, childrenCount, dogsCount, carsCount, selectedCustomerId, selectedGroupId]);


    const handleCustomerSelect = (customer: any) => {
        setSelectedCustomerId(customer.id);
        setFirstName(customer.first_name);
        setLastName(customer.last_name);
        setCustomerEmail(customer.email || '');
        setCustomerPhone(customer.phone);
        setLicensePlate(customer.license_plate || '');

        // If customer has a group, set it
        if (customer.customer_groups) {
            // We don't have the ID directly here usually if validation is strict, 
            // but let's assume autcomplete returns it or we leave it 'none' and let backend resolve it via ID.
            // Actually, Autocomplete usually returns joined group details.
            // For simplicity, let's keep 'none' to indicate "Use Customer Default" 
            // OR if we want to show it, we need to know the ID.
            // If manual edit happens, selectedCustomerId becomes null.
        } else if (customer.group_id) {
            setSelectedGroupId(customer.group_id);
        } else {
            setSelectedGroupId('none');
        }

        toast.success("Dati cliente caricati");
    };

    const handleManualEdit = (field: 'first' | 'last', value: string) => {
        if (field === 'first') setFirstName(value);
        if (field === 'last') setLastName(value);

        if (selectedCustomerId) {
            setSelectedCustomerId(null);
            // Keep the selected group as is, or reset? 
            // If they are creating a new user, they might want to set a group.
        }
    };

    const handleSaveBooking = async () => {
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
                pitch_id: currentPitchId,
                check_in: checkInState,
                check_out: checkOutState,
                guests_count: guestsCount + childrenCount,
                children_count: childrenCount,
                dogs_count: dogsCount,
                cars_count: carsCount,
                notes: notes,
                total_price: totalPrice,
                customer: {
                    first_name: firstName,
                    last_name: lastName,
                    email: customerEmail || null,
                    phone: customerPhone,
                    notes: notes,
                    license_plate: licensePlate || null,
                    group_id: selectedGroupId !== 'none' ? selectedGroupId : undefined
                },
            };

            const url = isEditMode ? `/api/bookings/${bookingId}` : '/api/bookings';
            const method = isEditMode ? 'PATCH' : 'POST';

            if (!isEditMode && selectedCustomerId) {
                (payload as any).customer_id = selectedCustomerId;
            }

            const bookingRes = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!bookingRes.ok) {
                const error = await bookingRes.json();
                throw new Error(error.error || `Failed to ${isEditMode ? 'update' : 'create'} booking`);
            }

            setSuccess(true);
            invalidateOccupancyCache();

            setTimeout(() => {
                onSuccess();
                onClose();
                if (!isEditMode) resetForm();
                setSelectedCustomerId(null);
            }, 1000);

        } catch (error) {
            logger.error(`Error ${isEditMode ? 'updating' : 'creating'} booking:`, { error });
            toast.error(`Errore ${isEditMode ? 'modifica' : 'prenotazione'}`, { 
                description: error instanceof Error ? error.message : "Errore durante il salvataggio" 
            });
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
        setSelectedGroupId('none');
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
                        {isEditMode ? 'Modifica Prenotazione' : `Nuova Prenotazione - Piazzola ${pitchNumber}`}
                    </DialogTitle>
                    <DialogDescription asChild>
                        <div className="flex flex-col gap-2 mt-2">
                            <div className="flex items-center gap-2">
                                <Badge variant="secondary">
                                    {formatDateLong(checkInState)} → {formatDateLong(checkOutState)}
                                </Badge>
                                <Badge variant="outline">
                                    {nights === 0 ? "1 giorno" : `${nights} ${nights === 1 ? "notte" : "notti"}`}
                                </Badge>
                            </div>
                            
                            {isEditMode && (
                                <div className="grid grid-cols-2 gap-2 mt-1">
                                    <div className="space-y-1">
                                        <Label className="text-[10px] uppercase">Arrivo</Label>
                                        <Input 
                                            type="date" 
                                            value={checkInState} 
                                            onChange={(e) => setCheckInState(e.target.value)}
                                            className="h-8 text-xs"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-[10px] uppercase">Partenza</Label>
                                        <Input 
                                            type="date" 
                                            value={checkOutState} 
                                            onChange={(e) => setCheckOutState(e.target.value)}
                                            className="h-8 text-xs"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </DialogDescription>
                </DialogHeader>

                {success ? (
                    <div className="py-8 text-center">
                        <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                            <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">{isEditMode ? 'Prenotazione Aggiornata!' : 'Prenotazione Creata!'}</h3>
                        <p className="text-sm text-muted-foreground">
                            La prenotazione è stata salvata con successo.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4 py-4">
                        {!isEditMode && (
                            <div className="space-y-2">
                                <Label>Cerca o Inserisci Cliente</Label>
                                <CustomerAutocomplete
                                    onSelect={handleCustomerSelect}
                                    onClear={() => setSelectedCustomerId(null)}
                                    selectedCustomerId={selectedCustomerId || undefined}
                                />
                            </div>
                        )}

                        {isEditMode && (
                            <div className="space-y-2">
                                <Label htmlFor="pitch-select">Assegnazione Piazzola/Tenda</Label>
                                <div className="grid grid-cols-1 gap-2">
                                    <select
                                        id="pitch-select"
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        value={currentPitchId}
                                        onChange={(e) => setCurrentPitchId(e.target.value)}
                                        disabled={loading}
                                    >
                                        <option value="" disabled>Seleziona una piazzola</option>
                                        {allPitches
                                            .sort((a, b) => a.number.localeCompare(b.number, undefined, { numeric: true }))
                                            .map((p) => (
                                                <option key={p.id} value={p.id}>
                                                    {p.type === 'piazzola' ? 'Piazzola' : 'Tenda'} {p.number} ({p.sector?.name || p.type})
                                                </option>
                                            ))}
                                    </select>
                                </div>
                            </div>
                        )}

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
                                    placeholder="Cognome"
                                    value={lastName}
                                    onChange={(e) => handleManualEdit('last', e.target.value)}
                                    disabled={loading}
                                />
                                <Input
                                    placeholder="Nome"
                                    value={firstName}
                                    onChange={(e) => handleManualEdit('first', e.target.value)}
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        {/* Customer Group Selector */}
                        <div className="space-y-2">
                            <Label>Gruppo Cliente</Label>
                            <select
                                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={selectedGroupId}
                                onChange={(e) => setSelectedGroupId(e.target.value)}
                                disabled={loading}
                            >
                                <option value="none">Nessun Gruppo (Standard)</option>
                                {customerGroups.map(group => (
                                    <option key={group.id} value={group.id}>
                                        {group.name}
                                    </option>
                                ))}
                            </select>
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
                        <Button onClick={handleSaveBooking} disabled={!firstName.trim() || !lastName.trim() || loading}>
                            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            {isEditMode ? 'Salva Modifiche' : 'Crea Prenotazione'}
                        </Button>
                    </DialogFooter>
                )}
            </DialogContent>
        </Dialog >
    );
}
