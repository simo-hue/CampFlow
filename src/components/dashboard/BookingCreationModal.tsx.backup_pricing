'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, FileText, Loader2, Check, Dog, Plus, X, Euro } from 'lucide-react';
import { calculateNights, formatDateLong } from '@/lib/dateUtils';
import { calculatePrice } from '@/lib/pricing';
import type { PitchType } from '@/lib/types';
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

    const nights = calculateNights(checkIn, checkOut);
    // Price calculation - handle single day selection
    let totalPrice = 0;
    try {
        // If same day selected, apply 1 day rate minimum
        const daysToCharge = nights > 0 ? nights : 1;
        if (daysToCharge === 1 && checkIn === checkOut) {
            // Single day selection - calculate as 1 day
            totalPrice = calculatePrice(checkIn, new Date(new Date(checkIn).getTime() + 86400000).toISOString().split("T")[0], pitchType);
        } else {
            totalPrice = calculatePrice(checkIn, checkOut, pitchType);
        }
    } catch (error) {
        console.error("Price calculation error:", error);
        toast.error("Errore calcolo prezzo", { description: "Verrà calcolato al salvataggio" });
    }

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
        setSuccess(false);
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
