'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { PricingSeason } from '@/lib/types';

interface SeasonDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: Partial<PricingSeason>) => void;
    initialData?: PricingSeason | null;
}

const PRIORITY_PRESETS = [
    { value: 0, label: 'Bassa (0)', description: 'Stagione standard' },
    { value: 5, label: 'Media (5)', description: 'Primavera/Autunno' },
    { value: 10, label: 'Alta (10)', description: 'Estate' },
    { value: 15, label: 'Molto Alta (15)', description: 'Festività' },
    { value: 20, label: 'Massima (20)', description: 'Eventi speciali' },
];

const COLOR_PRESETS = [
    { value: '#10b981', label: 'Verde' },
    { value: '#3b82f6', label: 'Blu' },
    { value: '#ef4444', label: 'Rosso' },
];

export function SeasonDialog({ open, onOpenChange, onSubmit, initialData }: SeasonDialogProps) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [piazzolaPrice, setPiazzolaPrice] = useState('30');
    const [tendaPrice, setTendaPrice] = useState('20');
    const [personPrice, setPersonPrice] = useState('10');
    const [childPrice, setChildPrice] = useState('5');
    const [dogPrice, setDogPrice] = useState('5');
    const [carPrice, setCarPrice] = useState('5');
    const [priority, setPriority] = useState(5);
    const [color, setColor] = useState('#3b82f6');

    // Reset form when dialog opens/closes or initialData changes
    useEffect(() => {
        if (open) {
            if (initialData) {
                setName(initialData.name);
                setDescription(initialData.description || '');
                setStartDate(initialData.start_date);
                setEndDate(initialData.end_date);
                setPiazzolaPrice(initialData.piazzola_price_per_day.toString());
                setTendaPrice(initialData.tenda_price_per_day.toString());
                setPersonPrice((initialData.person_price_per_day ?? 10).toString());
                setChildPrice((initialData.child_price_per_day ?? 5).toString());
                setDogPrice((initialData.dog_price_per_day ?? 5).toString());
                setCarPrice((initialData.car_price_per_day ?? 5).toString());
                setPriority(initialData.priority);
                setColor(initialData.color);
            } else {
                // Reset for new season
                setName('');
                setDescription('');
                setStartDate('');
                setEndDate('');
                setPiazzolaPrice('30');
                setTendaPrice('20');
                setPersonPrice('10');
                setChildPrice('5');
                setDogPrice('5');
                setCarPrice('5');
                setPriority(5);
                setColor('#3b82f6');
            }
        }
    }, [open, initialData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const data: Partial<PricingSeason> = {
            name,
            description: description || null,
            start_date: startDate,
            end_date: endDate,
            piazzola_price_per_day: parseFloat(piazzolaPrice),
            tenda_price_per_day: parseFloat(tendaPrice),
            person_price_per_day: parseFloat(personPrice),
            child_price_per_day: parseFloat(childPrice),
            dog_price_per_day: parseFloat(dogPrice),
            car_price_per_day: parseFloat(carPrice),
            priority,
            color,
        };

        onSubmit(data);
    };

    const isDirty = initialData ? (
        name !== initialData.name ||
        (description || '') !== (initialData.description || '') ||
        startDate !== initialData.start_date ||
        endDate !== initialData.end_date ||
        parseFloat(piazzolaPrice) !== (initialData.piazzola_price_per_day ?? 30) ||
        parseFloat(tendaPrice) !== (initialData.tenda_price_per_day ?? 20) ||
        parseFloat(personPrice) !== (initialData.person_price_per_day ?? 10) ||
        parseFloat(childPrice) !== (initialData.child_price_per_day ?? 5) ||
        parseFloat(dogPrice) !== (initialData.dog_price_per_day ?? 5) ||
        parseFloat(carPrice) !== (initialData.car_price_per_day ?? 5) ||
        priority !== initialData.priority ||
        color !== initialData.color
    ) : true;

    const isValid = name && startDate && endDate && piazzolaPrice && tendaPrice && isDirty;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>
                            {initialData ? 'Modifica Stagione' : 'Nuova Stagione'}
                        </DialogTitle>
                        <DialogDescription>
                            Configura il periodo e le tariffe per questa stagione
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        {/* Name */}
                        <div className="space-y-2">
                            <Label htmlFor="name">Nome Stagione *</Label>
                            <Input
                                id="name"
                                placeholder="es. Alta Stagione Estate, Ferragosto, Natale..."
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <Label htmlFor="description">Descrizione (opzionale)</Label>
                            <Textarea
                                id="description"
                                placeholder="Note aggiuntive sulla stagione..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={2}
                            />
                        </div>

                        {/* Date Range */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="start-date">Data Inizio *</Label>
                                <Input
                                    id="start-date"
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="end-date">Data Fine *</Label>
                                <Input
                                    id="end-date"
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        {/* Prices */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="piazzola-price">Prezzo Piazzola (€/giorno) *</Label>
                                <Input
                                    id="piazzola-price"
                                    type="number"
                                    min="1"
                                    step="1"
                                    value={piazzolaPrice}
                                    onChange={(e) => setPiazzolaPrice(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="tenda-price">Prezzo Tenda (€/giorno) *</Label>
                                <Input
                                    id="tenda-price"
                                    type="number"
                                    min="1"
                                    step="1"
                                    value={tendaPrice}
                                    onChange={(e) => setTendaPrice(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        {/* Extra Prices */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="person-price">Persona (€/giorno) *</Label>
                                <Input
                                    id="person-price"
                                    type="number"
                                    min="1"
                                    step="1"
                                    value={personPrice}
                                    onChange={(e) => setPersonPrice(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="child-price">Bambino (€/giorno) *</Label>
                                <Input
                                    id="child-price"
                                    type="number"
                                    min="1"
                                    step="1"
                                    value={childPrice}
                                    onChange={(e) => setChildPrice(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="dog-price">Cane (€/giorno) *</Label>
                                <Input
                                    id="dog-price"
                                    type="number"
                                    min="1"
                                    step="1"
                                    value={dogPrice}
                                    onChange={(e) => setDogPrice(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="car-price">Auto (€/giorno) *</Label>
                                <Input
                                    id="car-price"
                                    type="number"
                                    min="1"
                                    step="1"
                                    value={carPrice}
                                    onChange={(e) => setCarPrice(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        {/* Priority */}
                        <div className="space-y-2">
                            <Label htmlFor="priority">Priorità</Label>
                            <div className="text-sm text-muted-foreground mb-2">
                                In caso di sovrapposizione, vince la stagione con priorità più alta
                            </div>
                            <div className="grid grid-cols-5 gap-2">
                                {PRIORITY_PRESETS.map((preset) => (
                                    <button
                                        key={preset.value}
                                        type="button"
                                        onClick={() => setPriority(preset.value)}
                                        className={`p-3 text-center border-2 rounded-lg transition-all ${priority === preset.value
                                            ? 'border-primary bg-primary/10 font-semibold'
                                            : 'border-border hover:border-primary/50'
                                            }`}
                                        title={preset.description}
                                    >
                                        <div className="text-sm font-medium">{preset.label}</div>
                                    </button>
                                ))}
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                                <Label htmlFor="priority-input" className="text-xs">Personalizza:</Label>
                                <Input
                                    id="priority-input"
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={priority}
                                    onChange={(e) => setPriority(parseInt(e.target.value) || 0)}
                                    className="w-24"
                                />
                            </div>
                        </div>

                        {/* Color */}
                        <div className="space-y-2">
                            <Label htmlFor="color">Colore UI</Label>
                            <div className="flex items-center gap-4">
                                <div className="flex gap-2 flex-wrap">
                                    {COLOR_PRESETS.map((preset) => (
                                        <button
                                            key={preset.value}
                                            type="button"
                                            onClick={() => setColor(preset.value)}
                                            className={`w-10 h-10 rounded-lg border-2 transition-all ${color === preset.value
                                                ? 'border-foreground scale-110'
                                                : 'border-border hover:scale-105'
                                                }`}
                                            style={{ backgroundColor: preset.value }}
                                            title={preset.label}
                                        />
                                    ))}
                                </div>
                                <Input
                                    id="color"
                                    type="color"
                                    value={color}
                                    onChange={(e) => setColor(e.target.value)}
                                    className="w-20 h-10"
                                />
                            </div>
                        </div>

                        {/* Preview */}
                        {name && startDate && endDate && (
                            <div className="p-4 border rounded-lg" style={{ borderLeftColor: color, borderLeftWidth: '4px' }}>
                                <div className="font-semibold mb-1">{name}</div>
                                {description && <div className="text-sm text-muted-foreground mb-2">{description}</div>}
                                <div className="text-sm">
                                    <span>{startDate} → {endDate}</span>
                                    <span className="mx-2">•</span>
                                    <span>Piazzola: €{piazzolaPrice}</span>
                                    <span className="mx-2">•</span>
                                    <span>Tenda: €{tendaPrice}</span>
                                    <span className="mx-2">•</span>
                                    <span>Priorità: {priority}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Annulla
                        </Button>
                        <Button type="submit" disabled={!isValid}>
                            {initialData ? 'Salva Modifiche' : 'Crea Stagione'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
