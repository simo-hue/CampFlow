'use client';

import { useState } from 'react';
import { useSectors } from '@/hooks/useSectors';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { ConfirmationDialog } from '@/components/shared/ConfirmationDialog';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { toast } from "sonner";

export function SectorManagement() {
    const { sectors, isLoading, createSector, updateSector, deleteSector } = useSectors();

    // Dialog state for Create/Edit
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingSector, setEditingSector] = useState<{ id: string; name: string } | null>(null);
    const [name, setName] = useState('');

    // Confirmation state for Delete
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [sectorToDelete, setSectorToDelete] = useState<{ id: string; name: string } | null>(null);

    const handleAdd = () => {
        setEditingSector(null);
        setName('');
        setDialogOpen(true);
    };

    const handleEdit = (sector: { id: string; name: string }) => {
        setEditingSector(sector);
        setName(sector.name);
        setDialogOpen(true);
    };

    const handleDeleteClick = (sector: { id: string; name: string }) => {
        setSectorToDelete(sector);
        setConfirmOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (editingSector) {
                await updateSector.mutateAsync({
                    id: editingSector.id,
                    data: { name }
                });
            } else {
                await createSector.mutateAsync({ name });
            }
            setDialogOpen(false);
        } catch (error) {
            console.error('Error saving sector:', error);
            // Toast handled in hook
        }
    };

    const handleConfirmDelete = async () => {
        if (sectorToDelete) {
            await deleteSector.mutateAsync(sectorToDelete.id);
            setSectorToDelete(null);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Gestione Settori</h3>
                <Button size="sm" onClick={handleAdd}>
                    <Plus className="h-4 w-4 mr-2" />
                    Aggiungi Settore
                </Button>
            </div>

            {isLoading ? (
                <div className="text-center py-4 text-muted-foreground">Caricamento settori...</div>
            ) : sectors.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">Nessun settore configurato</div>
            ) : (
                <div className="border rounded-md">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nome</TableHead>
                                <TableHead className="text-right">Azioni</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sectors.map((sector) => (
                                <TableRow key={sector.id}>
                                    <TableCell className="font-medium">{sector.name}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => handleEdit(sector)}
                                                title="Modifica"
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => handleDeleteClick(sector)}
                                                title="Elimina"
                                                className="text-destructive hover:text-destructive"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}

            {/* Create/Edit Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingSector ? 'Modifica Settore' : 'Nuovo Settore'}</DialogTitle>
                        <DialogDescription>
                            {editingSector ? 'Modifica il nome del settore.' : 'Inserisci il nome del nuovo settore.'}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSave} className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="sector-name">Nome</Label>
                            <Input
                                id="sector-name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Es. Settore 1"
                                required
                            />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                                Annulla
                            </Button>
                            <Button type="submit">
                                Salva
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <ConfirmationDialog
                open={confirmOpen}
                onOpenChange={setConfirmOpen}
                title="Elimina Settore"
                description={`Sei sicuro di voler eliminare il settore "${sectorToDelete?.name}"? Questa azione potrebbe non essere consentita se ci sono piazzole associate.`}
                variant="destructive"
                actionLabel="Elimina"
                onConfirm={handleConfirmDelete}
            />
        </div>
    );
}
