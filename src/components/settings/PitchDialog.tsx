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
import type { Sector } from '@/hooks/useSectors';
import { toast } from "sonner";

interface PitchDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: CreatePitchRequest | UpdatePitchRequest) => Promise<void>;
    initialData?: Pitch | null;
    sectors: Sector[];
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

export function PitchDialog({ open, onOpenChange, onSubmit, initialData, sectors }: PitchDialogProps) {
    const isEditing = !!initialData;
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form state
    const [number, setNumber] = useState('');
    const [type, setType] = useState<PitchType>('piazzola');
    const [status, setStatus] = useState<PitchStatus>('available');
    const [createDouble, setCreateDouble] = useState(false);
    const [sectorId, setSectorId] = useState<string>('');

    // Reset or populate form
    useEffect(() => {
        if (open) {
            setError(null);
            if (initialData) {
                setNumber(initialData.number);
                setType(initialData.type);
                setStatus(initialData.status);
                setSectorId(initialData.sector_id || '');
            } else {
                setNumber('');
                setType('piazzola');
                setStatus('available');
                setCreateDouble(false);
                setSectorId('');
            }
        }
    }, [open, initialData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Attributes are no longer used as per user request
            const attributes: PitchAttributes = {};

            const submitSectorId = sectorId || undefined;

            if (isEditing) {
                await onSubmit({
                    type,
                    status,
                    attributes,
                    sector_id: submitSectorId,
                } as UpdatePitchRequest);
            } else {
                await onSubmit({
                    number,
                    type,
                    attributes,
                    create_double: createDouble,
                    sector_id: submitSectorId,
                } as CreatePitchRequest);
            }
            onOpenChange(false);
        } catch (err: any) {
            console.error('Error submitting form:', err);
            // If the error object has a message (from API response thrown by caller), display it.
            // Assuming onSubmit might throw an Error with the message.
            if (err instanceof Error) {
                setError(err.message);

                toast.error("Errore imprevisto", { description: err instanceof Error ? err.message : "Riprova più tardi" });
            } else {
                setError('Si è verificato un errore. Riprova.');
            }
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

                <form id="pitch-form" onSubmit={handleSubmit} className="space-y-4 py-4">
                    {error && (
                        <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
                            {error}
                        </div>
                    )}
                    {!isEditing && (
                        <>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="number" className="text-right">
                                    Numero
                                </Label>
                                <Input
                                    id="number"
                                    value={number}
                                    onChange={(e) => setNumber(e.target.value.replace(/\D/g, ''))}
                                    className="col-span-3"
                                    placeholder="es. 001"
                                    required
                                    maxLength={10}
                                />
                            </div>

                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="createDouble" className="text-right">
                                    Doppia
                                </Label>
                                <div className="col-span-3 flex items-center space-x-2">
                                    <Switch
                                        id="createDouble"
                                        checked={createDouble}
                                        onCheckedChange={setCreateDouble}
                                    />
                                    <Label htmlFor="createDouble" className="font-normal text-muted-foreground">
                                        Crea {number}a e {number}b
                                    </Label>
                                </div>
                            </div>
                        </>
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

                    {type !== 'tenda' && (
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="sector" className="text-right">
                                Settore
                            </Label>
                            <select
                                id="sector"
                                value={sectorId}
                                onChange={(e) => setSectorId(e.target.value)}
                                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            >
                                <option value="">Nessun Settore</option>
                                {sectors.map((s) => (
                                    <option key={s.id} value={s.id}>
                                        {s.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

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
                </form>

                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                        Annulla
                    </Button>
                    <Button type="submit" form="pitch-form" disabled={loading}>
                        {loading ? 'Salvataggio...' : 'Salva'}
                    </Button>
                </DialogFooter>
            </DialogContent >
        </Dialog >
    );
}
