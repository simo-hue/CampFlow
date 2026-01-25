'use client';

import { useState } from 'react';
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
import { getPitchDisplayNumber, canSplitPitch, getSiblingPitch, getPitchSector } from '@/lib/pitchUtils';
import { PitchDialog } from './PitchDialog';
import { ConfirmationDialog } from '@/components/shared/ConfirmationDialog';
import { toast } from "sonner";

// ... imports
import { usePitches } from '@/hooks/usePitches';
import { useSectors } from '@/hooks/useSectors';

export function PitchManagement() {
    const {
        pitches,
        isLoading: loading,
        createPitch,
        updatePitch,
        deletePitch,
        splitPitch,
        mergePitches
    } = usePitches();

    const { sectors } = useSectors();

    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState<string>('all');
    const [sectorFilter, setSectorFilter] = useState<string>('all');

    // Dialog State
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingPitch, setEditingPitch] = useState<Pitch | null>(null);

    // Confirmation State
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmConfig, setConfirmConfig] = useState<{
        title: string;
        description: string;
        onConfirm: () => Promise<void>;
        variant?: 'default' | 'destructive';
        actionLabel?: string;
    }>({
        title: '',
        description: '',
        onConfirm: async () => { },
        variant: 'default'
    });

    const handleAdd = () => {
        setEditingPitch(null);
        setDialogOpen(true);
    };

    const handleEdit = (pitch: Pitch) => {
        setEditingPitch(pitch);
        setDialogOpen(true);
    };

    const handleSave = async (data: CreatePitchRequest | UpdatePitchRequest) => {
        if (editingPitch) {
            // Update
            await updatePitch.mutateAsync({
                id: editingPitch.id,
                data: data as UpdatePitchRequest
            });
        } else {
            // Create
            await createPitch.mutateAsync(data as CreatePitchRequest);
        }
        setDialogOpen(false);
    };

    const handleSplit = (pitch: Pitch) => {
        setConfirmConfig({
            title: 'Sdoppia Piazzola',
            description: `Vuoi sdoppiare la piazzola ${getPitchDisplayNumber(pitch)} in ${pitch.number}a e ${pitch.number}b?`,
            onConfirm: async () => {
                await splitPitch.mutateAsync(pitch.id);
            },
            actionLabel: 'Sdoppia'
        });
        setConfirmOpen(true);
    };

    const handleMerge = (pitchA: Pitch, pitchB: Pitch) => {
        setConfirmConfig({
            title: 'Unisci Piazzole',
            description: `Vuoi unire ${getPitchDisplayNumber(pitchA)} e ${getPitchDisplayNumber(pitchB)} in una singola piazzola ${pitchA.number}?`,
            onConfirm: async () => {
                await mergePitches.mutateAsync({ pitchAId: pitchA.id, pitchBId: pitchB.id });
            },
            actionLabel: 'Unisci'
        });
        setConfirmOpen(true);
    };

    const handleDelete = (pitch: Pitch) => {
        setConfirmConfig({
            title: 'Elimina Piazzola',
            description: `Sei sicuro di voler eliminare la piazzola ${getPitchDisplayNumber(pitch)}? Questa azione non può essere annullata.`,
            variant: 'destructive',
            onConfirm: async () => {
                await deletePitch.mutateAsync(pitch.id);
            },
            actionLabel: 'Elimina'
        });
        setConfirmOpen(true);
    };

    const filteredPitches = pitches.filter(pitch => {
        const matchesSearch = searchTerm === '' ||
            getPitchDisplayNumber(pitch).toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = typeFilter === 'all' || pitch.type === typeFilter;

        // Filter by sector
        const sector = getPitchSector(pitch, sectors);
        const matchesSector = sectorFilter === 'all' || (sector && sector.id === sectorFilter);

        return matchesSearch && matchesType && matchesSector;
    });

    const getTypeColor = (type: string) => {
        switch (type) {
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
                    <Button size="sm" onClick={handleAdd}>
                        <Plus className="h-4 w-4 mr-2" />
                        Aggiungi
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

                {/* Type Filter */}
                <div className="w-48 space-y-2">
                    <Label>Tipo</Label>
                    <select
                        value={typeFilter}
                        onChange={(e) => {
                            const newType = e.target.value;
                            setTypeFilter(newType);
                            if (newType === 'tenda') {
                                setSectorFilter('all');
                            }
                        }}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                        <option value="all">Tutti</option>
                        <option value="piazzola">Piazzola</option>
                        <option value="tenda">Tenda</option>
                    </select>
                </div>

                {/* Sector Filter */}
                <div className={`w-48 space-y-2 ${typeFilter === 'tenda' ? 'opacity-50' : ''}`}>
                    <Label>Settore</Label>
                    <select
                        value={sectorFilter}
                        onChange={(e) => setSectorFilter(e.target.value)}
                        disabled={typeFilter === 'tenda'}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:cursor-not-allowed"
                    >
                        <option value="all">Tutti</option>
                        {sectors.map((sector) => (
                            <option key={sector.id} value={sector.id}>
                                {sector.name}
                            </option>
                        ))}
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
                sectors={sectors}
            />

            <ConfirmationDialog
                open={confirmOpen}
                onOpenChange={setConfirmOpen}
                title={confirmConfig.title}
                description={confirmConfig.description}
                onConfirm={confirmConfig.onConfirm}
                variant={confirmConfig.variant}
                actionLabel={confirmConfig.actionLabel}
            />
        </div>
    );
}
