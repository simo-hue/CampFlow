'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Users, Plus, Pencil, Trash2, Tag, AlertCircle } from 'lucide-react';
import { useCustomerGroups } from '@/hooks/useCustomerGroups';
import { useSeasons } from '@/hooks/useSeasons';
import type { CustomerGroup, GroupSeasonConfiguration, PricingSeason } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { formatCurrency } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export function GroupManagement() {
    const { groups, isLoading: groupsLoading, createGroup, updateGroup, deleteGroup } = useCustomerGroups();
    const { seasons, isLoading: seasonsLoading } = useSeasons();

    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingGroup, setEditingGroup] = useState<CustomerGroup | null>(null);
    const [formData, setFormData] = useState<Partial<CustomerGroup>>({
        name: '',
        description: '',
        color: '#3b82f6',
        season_configurations: []
    });

    const activeSeasons = seasons.filter(s => s.is_active).sort((a, b) => b.priority - a.priority);

    // Reset form when dialog opens/closes
    useEffect(() => {
        if (!dialogOpen) {
            setFormData({ name: '', description: '', color: '#3b82f6', season_configurations: [] });
            setEditingGroup(null);
        }
    }, [dialogOpen]);

    const handleEdit = (group: CustomerGroup) => {
        setEditingGroup(group);
        setFormData({
            ...group,
            season_configurations: group.season_configurations || []
        });
        setDialogOpen(true);
    };

    const handleDelete = async (id: string, name: string) => {
        if (confirm(`Sei sicuro di voler eliminare il gruppo "${name}"?`)) {
            await deleteGroup.mutateAsync(id);
        }
    };

    const handleSave = async () => {
        if (!formData.name) return;

        try {
            if (editingGroup) {
                await updateGroup.mutateAsync({
                    id: editingGroup.id,
                    data: formData
                });
            } else {
                await createGroup.mutateAsync(formData);
            }
            setDialogOpen(false);
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold">Gruppi Clienti</h3>
                    <p className="text-sm text-muted-foreground">
                        Crea gruppi per gestire sconti e convenzioni
                    </p>
                </div>
                <Button size="sm" onClick={() => setDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nuovo Gruppo
                </Button>
            </div>

            {groupsLoading ? (
                <div className="text-center py-8 text-muted-foreground">Caricamento...</div>
            ) : groups.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed rounded-lg bg-muted/20">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground mb-4">Nessun gruppo configurato</p>
                    <Button onClick={() => setDialogOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Crea Gruppo
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {groups.map((group) => (
                        <Card key={group.id} className="p-4 flex items-start justify-between group hover:shadow-md transition-shadow relative overflow-hidden">
                            <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: group.color }} />
                            <div className="pl-2">
                                <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-semibold text-lg">{group.name}</h4>
                                    {group.season_configurations && group.season_configurations.length > 0 && (
                                        <Badge variant="secondary" className="text-xs">
                                            {group.season_configurations.length} Config.
                                        </Badge>
                                    )}
                                </div>
                                {group.description && (
                                    <p className="text-sm text-muted-foreground mb-3">{group.description}</p>
                                )}
                                <div className="flex gap-2 text-xs text-muted-foreground">
                                    <Tag className="h-3 w-3 mt-0.5" />
                                    <span>
                                        {group.season_configurations?.some(c => c.discount_percentage)
                                            ? 'Include Sconti %'
                                            : 'Tariffe standard'}
                                    </span>
                                </div>
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button size="sm" variant="ghost" onClick={() => handleEdit(group)}>
                                    <Pencil className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => handleDelete(group.id, group.name)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* Edit/Create Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle>{editingGroup ? 'Modifica Gruppo' : 'Nuovo Gruppo'}</DialogTitle>
                        <DialogDescription>
                            Configura i dettagli del gruppo e le regole di sconto stagionali.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto pr-2 space-y-6 py-4">
                        {/* Basic Details */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-1 space-y-2">
                                <Label htmlFor="name">Nome Gruppo</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="Es. VIP, Soci Club..."
                                />
                            </div>
                            <div className="col-span-1 space-y-2">
                                <Label htmlFor="color">Colore Etichetta</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="color"
                                        type="color"
                                        value={formData.color}
                                        onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                                        className="w-12 h-10 p-1 cursor-pointer"
                                    />
                                    <Input
                                        value={formData.color}
                                        onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                                        placeholder="#000000"
                                    />
                                </div>
                            </div>
                            <div className="col-span-2 space-y-2">
                                <Label htmlFor="description">Descrizione</Label>
                                <Input
                                    id="description"
                                    value={formData.description || ''}
                                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                    placeholder="Note interne..."
                                />
                            </div>
                        </div>

                        {/* Seasonal Configuration */}
                        <div className="space-y-4 border-t pt-4">
                            <div className="flex items-center justify-between">
                                <h4 className="font-semibold text-base">Tariffe & Sconti per Stagione</h4>
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <AlertCircle className="h-4 w-4 text-muted-foreground" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p className="max-w-xs">
                                                Puoi applicare uno Sconto % cumulativo su tutto, OPPURE definire Prezzi Personalizzati specifici che sovrascrivono il listino base.
                                            </p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>

                            {seasonsLoading ? (
                                <div className="text-sm">Caricamento stagioni...</div>
                            ) : (
                                <div className="space-y-4">
                                    {activeSeasons.map(season => (
                                        <SeasonConfigRow
                                            key={season.id}
                                            season={season}
                                            config={formData.season_configurations?.find(c => c.season_id === season.id) || null}
                                            onChange={(newConfig) => {
                                                const others = formData.season_configurations?.filter(c => c.season_id !== season.id) || [];
                                                // If newConfig is essentially empty/default, we could remove it, but keeping it is fine.
                                                setFormData({
                                                    ...formData,
                                                    season_configurations: [...others, newConfig]
                                                });
                                            }}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={createGroup.isPending || updateGroup.isPending}>
                            Annulla
                        </Button>
                        <Button onClick={handleSave} disabled={createGroup.isPending || updateGroup.isPending}>
                            {createGroup.isPending || updateGroup.isPending ? 'Salvataggio...' : 'Salva Modifiche'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

// Sub-component for individual season row configuration
function SeasonConfigRow({
    season,
    config,
    onChange
}: {
    season: PricingSeason,
    config: GroupSeasonConfiguration | null,
    onChange: (cfg: GroupSeasonConfiguration) => void
}) {
    const [mode, setMode] = useState<'discount' | 'custom'>(config?.custom_rates && Object.keys(config.custom_rates).length > 0 ? 'custom' : 'discount');

    // Helper to get nested value safely
    const getRate = (key: string) => {
        if (!config?.custom_rates) return undefined;
        // @ts-ignore - Dynamic access to optional CustomRates
        return config.custom_rates[key] as number | undefined;
    };

    const updateConfig = (updates: Partial<GroupSeasonConfiguration>) => {
        onChange({
            id: config?.id || crypto.randomUUID(), // Temp ID for new configs
            group_id: config?.group_id || '', // Will be set by backend/context
            season_id: season.id,
            discount_percentage: config?.discount_percentage,
            custom_rates: config?.custom_rates || {},
            created_at: config?.created_at || new Date().toISOString(),
            updated_at: new Date().toISOString(),
            ...updates
        });
    };

    const updateCustomRate = (key: string, value: string) => {
        const numVal = value === '' ? undefined : parseFloat(value);
        const currentRates = config?.custom_rates || {};
        updateConfig({
            custom_rates: {
                ...currentRates,
                [key]: numVal
            },
            // Reset discount if setting custom rates? No, maybe allow mixing? Plan said "Overrides override season rates, then discount applied".
            // So we can have both. But UI might be simpler if toggle. 
            // Let's allow both but emphasize tabs.
        });
    };

    return (
        <div className="border rounded-md p-3 bg-muted/20">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2" style={{ borderLeft: `3px solid ${season.color}`, paddingLeft: '8px' }}>
                    <span className="font-semibold text-sm">{season.name}</span>
                    {season.priority > 10 && <Badge variant="destructive" className="text-[10px] h-5">Alta Prio</Badge>}
                </div>
            </div>

            <Tabs value={mode} onValueChange={(v: any) => setMode(v)} className="w-full">
                <TabsList className="grid w-full grid-cols-2 h-8">
                    <TabsTrigger value="discount" className="text-xs">Sconto Percentuale</TabsTrigger>
                    <TabsTrigger value="custom" className="text-xs">Tariffe Personalizzate</TabsTrigger>
                </TabsList>

                <TabsContent value="discount" className="pt-2">
                    <div className="flex items-center gap-4">
                        <Label className="text-sm min-w-[100px]">Percentuale Sconto</Label>
                        <div className="relative w-32">
                            <Input
                                type="number"
                                min="0"
                                max="100"
                                placeholder="0"
                                value={config?.discount_percentage ?? ''}
                                onChange={(e) => updateConfig({ discount_percentage: parseFloat(e.target.value) || 0 })}
                                className="pr-6"
                            />
                            <span className="absolute right-2 top-2.5 text-xs text-muted-foreground">%</span>
                        </div>
                        <p className="text-xs text-muted-foreground flex-1">
                            Applicato al totale giornaliero calcolato con le tariffe base della stagione.
                        </p>
                    </div>
                </TabsContent>

                <TabsContent value="custom" className="pt-2 space-y-3">
                    <p className="text-xs text-muted-foreground mb-2">
                        I valori inseriti sovrascriveranno quelli della stagione base. Lascia vuoto per usare il prezzo standard.
                    </p>
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                        <div className="space-y-1">
                            <Label className="text-[10px] uppercase text-muted-foreground">Piazzola</Label>
                            <Input type="number" step="0.5" placeholder={season.piazzola_price_per_day.toString()} value={getRate('piazzola') ?? ''} onChange={e => updateCustomRate('piazzola', e.target.value)} className="h-8 text-sm" />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-[10px] uppercase text-muted-foreground">Tenda</Label>
                            <Input type="number" step="0.5" placeholder={season.tenda_price_per_day.toString()} value={getRate('tenda') ?? ''} onChange={e => updateCustomRate('tenda', e.target.value)} className="h-8 text-sm" />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-[10px] uppercase text-muted-foreground">Persona</Label>
                            <Input type="number" step="0.5" placeholder={season.person_price_per_day?.toString() || '0'} value={getRate('person') ?? ''} onChange={e => updateCustomRate('person', e.target.value)} className="h-8 text-sm" />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-[10px] uppercase text-muted-foreground">Bambino</Label>
                            <Input type="number" step="0.5" placeholder={season.child_price_per_day?.toString() || '0'} value={getRate('child') ?? ''} onChange={e => updateCustomRate('child', e.target.value)} className="h-8 text-sm" />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-[10px] uppercase text-muted-foreground">Cane</Label>
                            <Input type="number" step="0.5" placeholder={season.dog_price_per_day?.toString() || '0'} value={getRate('dog') ?? ''} onChange={e => updateCustomRate('dog', e.target.value)} className="h-8 text-sm" />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-[10px] uppercase text-muted-foreground">Auto</Label>
                            <Input type="number" step="0.5" placeholder={season.car_price_per_day?.toString() || '0'} value={getRate('car') ?? ''} onChange={e => updateCustomRate('car', e.target.value)} className="h-8 text-sm" />
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
