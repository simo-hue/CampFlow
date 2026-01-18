'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Split,
    Merge,
    Pencil,
    Trash2,
    Plus,
    Search,
    RefreshCw
} from 'lucide-react';
import type { Pitch, CreatePitchRequest, UpdatePitchRequest } from '@/lib/types';
import { getPitchDisplayNumber, canSplitPitch, getSiblingPitch } from '@/lib/pitchUtils';
import { PitchDialog } from './PitchDialog';

export function PitchManagement() {
    const [pitches, setPitches] = useState<Pitch[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState<string>('all');

    // Dialog State
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingPitch, setEditingPitch] = useState<Pitch | null>(null);

    useEffect(() => {
        loadPitches();
    }, []);

    const loadPitches = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/pitches');
            if (response.ok) {
                const data = await response.json();
                setPitches(data.pitches || []);
            }
        } catch (error) {
            console.error('Error loading pitches:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = () => {
        setEditingPitch(null);
        setDialogOpen(true);
    };

    const handleEdit = (pitch: Pitch) => {
        setEditingPitch(pitch);
        setDialogOpen(true);
    };

    const handleSave = async (data: CreatePitchRequest | UpdatePitchRequest) => {
        try {
            let response;
            if (editingPitch) {
                // Update
                response = await fetch(`/api/pitches?id=${editingPitch.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data),
                });
            } else {
                // Create
                response = await fetch('/api/pitches', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data),
                });
            }

            if (response.ok) {
                await loadPitches();
                return;
            } else {
                const error = await response.json();
                alert(`Errore: ${error.error}`);
            }
        } catch (error) {
            console.error('Error saving pitch:', error);
            alert('Errore durante il salvataggio');
        }
    };

    const handleSplit = async (pitch: Pitch) => {
        if (!confirm(`Vuoi sdoppiare la piazzola ${getPitchDisplayNumber(pitch)} in ${pitch.number}a e ${pitch.number}b?`)) {
            return;
        }

        try {
            const response = await fetch('/api/pitches/split', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pitch_id: pitch.id }),
            });

            if (response.ok) {
                await loadPitches();
                alert('Piazzola sdoppiata con successo!');
            } else {
                const error = await response.json();
                alert(`Errore: ${error.error}`);
            }
        } catch (error) {
            console.error('Error splitting pitch:', error);
            alert('Errore durante lo sdoppiamento');
        }
    };

    const handleMerge = async (pitchA: Pitch, pitchB: Pitch) => {
        if (!confirm(`Vuoi unire ${getPitchDisplayNumber(pitchA)} e ${getPitchDisplayNumber(pitchB)} in una singola piazzola ${pitchA.number}?`)) {
            return;
        }

        try {
            const response = await fetch('/api/pitches/merge', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    pitch_a_id: pitchA.id,
                    pitch_b_id: pitchB.id,
                }),
            });

            if (response.ok) {
                await loadPitches();
                alert('Piazzole unite con successo!');
            } else {
                const error = await response.json();
                alert(`Errore: ${error.error}`);
            }
        } catch (error) {
            console.error('Error merging pitches:', error);
            alert('Errore durante l\'unione');
        }
    };

    const handleDelete = async (pitch: Pitch) => {
        if (!confirm(`Sei sicuro di voler eliminare la piazzola ${getPitchDisplayNumber(pitch)}?`)) {
            return;
        }

        try {
            const response = await fetch(`/api/pitches?id=${pitch.id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                await loadPitches();
                alert('Piazzola eliminata con successo!');
            } else {
                const error = await response.json();
                alert(`Errore: ${error.error}`);
            }
        } catch (error) {
            console.error('Error deleting pitch:', error);
            alert('Errore durante l\'eliminazione');
        }
    };

    const filteredPitches = pitches.filter(pitch => {
        const matchesSearch = searchTerm === '' ||
            getPitchDisplayNumber(pitch).toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = typeFilter === 'all' || pitch.type === typeFilter;
        return matchesSearch && matchesType;
    });

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'standard': return 'bg-gray-500';
            case 'comfort': return 'bg-blue-500';
            case 'premium': return 'bg-purple-500';
            case 'piazzola': return 'bg-green-500';
            case 'tenda': return 'bg-orange-500';
            default: return 'bg-gray-500';
        }
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Gestione Piazzole e Tende</h3>
                <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={loadPitches}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Ricarica
                    </Button>
                    <Button size="sm" onClick={handleAdd}>
                        <Plus className="h-4 w-4 mr-2" />
                        Aggiungi Piazzola
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-4">
                <div className="flex-1 space-y-2">
                    <Label>Cerca</Label>
                    <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Numero piazzola..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-8"
                        />
                    </div>
                </div>
                <div className="w-48 space-y-2">
                    <Label>Tipo</Label>
                    <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                        <option value="all">Tutti</option>
                        <option value="standard">Standard</option>
                        <option value="comfort">Comfort</option>
                        <option value="premium">Premium</option>
                        <option value="piazzola">Piazzola</option>
                        <option value="tenda">Tenda</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            {loading ? (
                <div className="text-center py-8 text-muted-foreground">
                    Caricamento...
                </div>
            ) : filteredPitches.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                    Nessuna piazzola trovata
                </div>
            ) : (
                <div className="border rounded-md">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Numero</TableHead>
                                <TableHead>Tipo</TableHead>
                                <TableHead>Stato</TableHead>
                                <TableHead>Caratteristiche</TableHead>
                                <TableHead className="text-right">Azioni</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredPitches.map((pitch) => {
                                const sibling = getSiblingPitch(pitch, pitches);
                                const canSplit = canSplitPitch(pitch);

                                return (
                                    <TableRow key={pitch.id}>
                                        <TableCell className="font-medium">
                                            {getPitchDisplayNumber(pitch)}
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={getTypeColor(pitch.type)}>
                                                {pitch.type}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={pitch.status === 'available' ? 'default' : 'secondary'}>
                                                {pitch.status === 'available' ? 'Disponibile' :
                                                    pitch.status === 'maintenance' ? 'Manutenzione' : 'Bloccata'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {Object.entries(pitch.attributes)
                                                .filter(([key, value]) => value === true && key !== 'size_sqm')
                                                .map(([key]) => key)
                                                .join(', ') || '-'}
                                            {pitch.attributes.size_sqm ? ` ${pitch.attributes.size_sqm}mq` : ''}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    title="Modifica"
                                                    onClick={() => handleEdit(pitch)}
                                                >
                                                    <Pencil className="h-3 w-3" />
                                                </Button>

                                                {canSplit && (
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => handleSplit(pitch)}
                                                        title="Sdoppia"
                                                    >
                                                        <Split className="h-3 w-3" />
                                                    </Button>
                                                )}

                                                {sibling && (
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => handleMerge(pitch, sibling)}
                                                        title={`Unisci con ${getPitchDisplayNumber(sibling)}`}
                                                    >
                                                        <Merge className="h-3 w-3" />
                                                    </Button>
                                                )}

                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => handleDelete(pitch)}
                                                    title="Elimina"
                                                    className="text-destructive hover:text-destructive"
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            )}

            {/* Stats */}
            <div className="flex gap-4 text-sm text-muted-foreground">
                <span>Totale: {filteredPitches.length}</span>
                <span>Singole: {filteredPitches.filter(p => p.suffix === '').length}</span>
                <span>Doppie: {filteredPitches.filter(p => p.suffix !== '').length / 2}</span>
            </div>

            <PitchDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                onSubmit={handleSave}
                initialData={editingPitch}
            />
        </div>
    );
}
