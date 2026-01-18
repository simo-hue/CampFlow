import { useEffect, useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import type { Pitch, CreatePitchRequest, UpdatePitchRequest, PitchAttributes, PitchType, PitchStatus } from '@/lib/types';

interface PitchDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: CreatePitchRequest | UpdatePitchRequest) => Promise<void>;
    initialData?: Pitch | null;
}

const PITCH_TYPES: { value: PitchType; label: string }[] = [
    { value: 'piazzola', label: 'Piazzola' },
    { value: 'tenda', label: 'Tenda' },
];

const PITCH_STATUSES: { value: PitchStatus; label: string }[] = [
    { value: 'available', label: 'Disponibile' },
    { value: 'maintenance', label: 'Manutenzione' },
    { value: 'blocked', label: 'Bloccata' },
];

export function PitchDialog({ open, onOpenChange, onSubmit, initialData }: PitchDialogProps) {
    const isEditing = !!initialData;
    const [loading, setLoading] = useState(false);

    // Form state
    const [number, setNumber] = useState('');
    const [type, setType] = useState<PitchType>('piazzola');
    const [status, setStatus] = useState<PitchStatus>('available');

    // Attributes
    const [shade, setShade] = useState(false);
    const [electricity, setElectricity] = useState(false);
    const [water, setWater] = useState(false);
    const [sewer, setSewer] = useState(false);
    const [sizeSqm, setSizeSqm] = useState(60);

    // Reset or populate form
    useEffect(() => {
        if (open) {
            if (initialData) {
                setNumber(initialData.number);
                setType(initialData.type);
                setStatus(initialData.status);
                setShade(initialData.attributes.shade || false);
                setElectricity(initialData.attributes.electricity || false);
                setWater(initialData.attributes.water || false);
                setSewer(initialData.attributes.sewer || false);
                setSizeSqm(initialData.attributes.size_sqm || 60);
            } else {
                setNumber('');
                setType('piazzola');
                setStatus('available');
                setShade(false);
                setElectricity(true);
                setWater(false);
                setSewer(false);
                setSizeSqm(60);
            }
        }
    }, [open, initialData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const attributes: PitchAttributes = {
                shade,
                electricity,
                water,
                sewer,
                size_sqm: sizeSqm,
            };

            if (isEditing) {
                await onSubmit({
                    type,
                    status,
                    attributes,
                } as UpdatePitchRequest);
            } else {
                await onSubmit({
                    number,
                    type,
                    attributes,
                    create_double: false, // Default to single, splitting is separate action
                } as CreatePitchRequest);
            }
            onOpenChange(false);
        } catch (error) {
            console.error('Error submitting form:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'Modifica Piazzola' : 'Nuova Piazzola'}</DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? `Modifica i dettagli della piazzola ${initialData.number}${initialData.suffix}`
                            : 'Inserisci i dati per la nuova piazzola.'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    {!isEditing && (
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="number" className="text-right">
                                Numero
                            </Label>
                            <Input
                                id="number"
                                value={number}
                                onChange={(e) => setNumber(e.target.value)}
                                className="col-span-3"
                                placeholder="es. 001"
                                required
                                maxLength={10}
                            />
                        </div>
                    )}

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="type" className="text-right">
                            Tipo
                        </Label>
                        <select
                            id="type"
                            value={type}
                            onChange={(e) => setType(e.target.value as PitchType)}
                            className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                            {PITCH_TYPES.map((t) => (
                                <option key={t.value} value={t.value}>
                                    {t.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {isEditing && (
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="status" className="text-right">
                                Stato
                            </Label>
                            <select
                                id="status"
                                value={status}
                                onChange={(e) => setStatus(e.target.value as PitchStatus)}
                                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            >
                                {PITCH_STATUSES.map((s) => (
                                    <option key={s.value} value={s.value}>
                                        {s.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="size" className="text-right">
                            Mq
                        </Label>
                        <Input
                            id="size"
                            type="number"
                            value={sizeSqm}
                            onChange={(e) => setSizeSqm(Number(e.target.value))}
                            className="col-span-3"
                            min={1}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Caratteristiche</Label>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center space-x-2">
                                <Switch id="shade" checked={shade} onCheckedChange={setShade} />
                                <Label htmlFor="shade">Ombreggiata</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Switch id="electricity" checked={electricity} onCheckedChange={setElectricity} />
                                <Label htmlFor="electricity">Elettricità</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Switch id="water" checked={water} onCheckedChange={setWater} />
                                <Label htmlFor="water">Acqua</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Switch id="sewer" checked={sewer} onCheckedChange={setSewer} />
                                <Label htmlFor="sewer">Scarico</Label>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Annulla
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Salvataggio...' : 'Salva'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
