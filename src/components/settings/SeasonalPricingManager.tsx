'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, Calendar } from 'lucide-react';
import type { PricingSeason } from '@/lib/types';
import { SeasonDialog } from './SeasonDialog';
import { SeasonStackVisualization } from './SeasonStackVisualization';
import { toast } from 'sonner';
import { format, parseISO } from 'date-fns';
import { it } from 'date-fns/locale';
import { useSeasons } from '@/hooks/useSeasons';
import { formatCurrency } from '@/lib/utils';

export function SeasonalPricingManager() {
    const {
        seasons,
        isLoading: loading,
        saveSeason,
        deleteSeason
    } = useSeasons();

    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingSeason, setEditingSeason] = useState<PricingSeason | null>(null);
    const [seasonToDelete, setSeasonToDelete] = useState<PricingSeason | null>(null);

    const handleAdd = () => {
        setEditingSeason(null);
        setDialogOpen(true);
    };

    const handleEdit = (season: PricingSeason) => {
        setEditingSeason(season);
        setDialogOpen(true);
    };

    const handleSave = async (data: Partial<PricingSeason>) => {
        try {
            await saveSeason.mutateAsync({
                id: editingSeason?.id,
                data
            });
            setDialogOpen(false);
        } catch (error) {
            console.error('Error saving season:', error);
            // Toast handled in hook
        }
    };

    const handleDelete = (season: PricingSeason) => {
        setSeasonToDelete(season);
    };

    const confirmDelete = async () => {
        if (!seasonToDelete) return;

        try {
            await deleteSeason.mutateAsync(seasonToDelete.id);
            setSeasonToDelete(null);
        } catch (error) {
            console.error("Error deleting season:", error);
        }
    };

    const formatDateRange = (startDate: string, endDate: string) => {
        const start = parseISO(startDate);
        const end = parseISO(endDate);
        return `${format(start, 'd MMM', { locale: it })} - ${format(end, 'd MMM yyyy', { locale: it })}`;
    };

    const getPriorityBadge = (priority: number) => {
        if (priority >= 15) return { label: 'Alta', variant: 'destructive' as const };
        if (priority >= 5) return { label: 'Media', variant: 'default' as const };
        return { label: 'Bassa', variant: 'secondary' as const };
    };

    // Group seasons by active status
    const activeSeasons = seasons.filter(s => s.is_active);
    const inactiveSeasons = seasons.filter(s => !s.is_active);

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold">Gestione Stagioni Pricing</h3>
                    <p className="text-sm text-muted-foreground">
                        Configura i periodi stagionali e le tariffe
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button size="sm" onClick={handleAdd}>
                        <Plus className="h-4 w-4 mr-2" />
                        Nuova Stagione
                    </Button>
                </div>
            </div>

            {/* Info Box */}
            <div className="p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div className="flex-1">
                        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                            Sistema con Priorità
                        </h4>
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                            Le stagioni possono sovrapporsi. In caso di conflitto, vince la stagione con <strong>priorità più alta</strong>.
                            Esempio: Ferragosto (priorità 20) sovrascrive Alta Stagione (priorità 10) nei giorni 10-20 Agosto.
                        </p>
                    </div>
                </div>
            </div>

            {/* Season Stack Visualization */}
            <SeasonStackVisualization seasons={activeSeasons} />

            {/* Active Seasons List */}
            {loading ? (
                <div className="text-center py-8 text-muted-foreground">
                    Caricamento...
                </div>
            ) : activeSeasons.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed rounded-lg bg-muted/20">
                    <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground mb-4">Nessuna stagione configurata</p>
                    <Button onClick={handleAdd}>
                        <Plus className="h-4 w-4 mr-2" />
                        Crea Prima Stagione
                    </Button>
                </div>
            ) : (
                <div className="space-y-3">
                    {activeSeasons.map((season) => {
                        const priorityBadge = getPriorityBadge(season.priority);

                        return (
                            <div
                                key={season.id}
                                className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                                style={{ borderLeftColor: season.color, borderLeftWidth: '4px' }}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <h4 className="font-semibold">{season.name}</h4>
                                            <Badge variant={priorityBadge.variant}>
                                                Priorità {season.priority} ({priorityBadge.label})
                                            </Badge>
                                        </div>

                                        {season.description && (
                                            <p className="text-sm text-muted-foreground mb-2">
                                                {season.description}
                                            </p>
                                        )}

                                        <div className="flex items-center gap-4 text-sm">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                                <span>{formatDateRange(season.start_date, season.end_date)}</span>
                                            </div>
                                        </div>

                                        <div className="flex gap-4 mt-2">
                                            <div>
                                                <span className="text-xs text-muted-foreground">Piazzola:</span>
                                                <span className="ml-2 font-semibold">{formatCurrency(season.piazzola_price_per_day)}/giorno</span>
                                            </div>
                                            <div>
                                                <span className="text-xs text-muted-foreground">Tenda:</span>
                                                <span className="ml-2 font-semibold">{formatCurrency(season.tenda_price_per_day)}/giorno</span>
                                            </div>
                                        </div>
                                        <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
                                            <div>
                                                <span>P: {formatCurrency(season.person_price_per_day ?? 0)}</span>
                                            </div>
                                            <div>
                                                <span>B: {formatCurrency(season.child_price_per_day ?? 0)}</span>
                                            </div>
                                            <div>
                                                <span>C: {formatCurrency(season.dog_price_per_day ?? 0)}</span>
                                            </div>
                                            <div>
                                                <span>A: {formatCurrency(season.car_price_per_day ?? 0)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-1 ml-4">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => handleEdit(season)}
                                            title="Modifica"
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => handleDelete(season)}
                                            title="Elimina"
                                            className="text-destructive hover:text-destructive"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Inactive Seasons (if any) */}
            {inactiveSeasons.length > 0 && (
                <details className="mt-6">
                    <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                        Stagioni archiviate ({inactiveSeasons.length})
                    </summary>
                    <div className="mt-3 space-y-2">
                        {inactiveSeasons.map((season) => (
                            <div key={season.id} className="p-3 bg-muted/50 rounded text-sm opacity-60">
                                <span className="font-medium">{season.name}</span>
                                <span className="mx-2">•</span>
                                <span className="font-medium text-xs">
                                    {formatDateRange(season.start_date, season.end_date)}
                                </span>
                            </div>
                        ))}
                    </div>
                </details>
            )}



            {/* Delete Confirmation Dialog */}
            <Dialog open={!!seasonToDelete} onOpenChange={(open) => !open && setSeasonToDelete(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Elimina Stagione</DialogTitle>
                        <DialogDescription>
                            Sei sicuro di voler eliminare la stagione o le stagioni selezionate?
                            <br />
                            <span className="font-semibold text-foreground">
                                "{seasonToDelete?.name}"
                            </span>
                            <br />
                            Questa azione non può essere annullata.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setSeasonToDelete(null)}
                            disabled={deleteSeason.isPending}
                        >
                            Annulla
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => seasonToDelete && confirmDelete()}
                            disabled={deleteSeason.isPending}
                        >
                            {deleteSeason.isPending ? "Eliminazione..." : "Elimina"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <SeasonDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                onSubmit={handleSave}
                initialData={editingSeason}
            />
        </div >
    );
}
