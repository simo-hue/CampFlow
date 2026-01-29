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
import type { CustomerGroup, GroupSeasonConfiguration, PricingSeason, GroupBundle } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { formatCurrency } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export function GroupManagement() {
    const { groups, isLoading: groupsLoading, createGroup, updateGroup, deleteGroup } = useCustomerGroups();
    const { seasons, isLoading: seasonsLoading } = useSeasons();

    const [dialogOpen, setDialogOpen] = useState(false);
    const [deleteConfirmation, setDeleteConfirmation] = useState<{ isOpen: boolean; groupId: string; groupName: string } | null>(null);
    const [editingGroup, setEditingGroup] = useState<CustomerGroup | null>(null);
    const [formData, setFormData] = useState<Partial<CustomerGroup>>({
        name: '',
        description: '',
        color: '#3b82f6',
        season_configurations: [],
        bundles: []
    });

    const activeSeasons = seasons.filter(s => s.is_active).sort((a, b) => b.priority - a.priority);

    // Reset form when dialog opens/closes
    useEffect(() => {
        if (!dialogOpen) {
            setFormData({ name: '', description: '', color: '#3b82f6', season_configurations: [], bundles: [] });
            setEditingGroup(null);
            setError(null);
        }
    }, [dialogOpen]);

    const handleEdit = (group: CustomerGroup) => {
        setEditingGroup(group);
        setFormData({
            ...group,
            season_configurations: group.season_configurations || [],
            bundles: group.bundles || []
        });
        setDialogOpen(true);
    };

    const handleDeleteClick = (id: string, name: string) => {
        setDeleteConfirmation({ isOpen: true, groupId: id, groupName: name });
    };

    const confirmDelete = async () => {
        if (deleteConfirmation) {
            await deleteGroup.mutateAsync(deleteConfirmation.groupId);
            setDeleteConfirmation(null);
        }
    };

    const [error, setError] = useState<string | null>(null);

    const handleSave = async () => {
        if (!formData.name) return;
        setError(null);

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
        } catch (e: any) {
            console.error(e);
            if (e.message?.includes('customer_groups_name_key') || e.message?.includes('duplicate key')) {
                setError("Esiste già un gruppo con questo nome. Scegli un nome diverso.");
            } else {
                setError("Si è verificato un errore durante il salvataggio. Riprova.");
            }
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
                                    {group.bundles && group.bundles.length > 0 && (
                                        <span className="flex items-center gap-1 ml-2">
                                            <Tag className="h-3 w-3" />
                                            {group.bundles.length} Offerte
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button size="sm" variant="ghost" onClick={() => handleEdit(group)}>
                                    <Pencil className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => handleDeleteClick(group.id, group.name)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* Edit/Create Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="w-full max-w-4xl lg:max-w-6xl max-h-[90vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle>{editingGroup ? 'Modifica Gruppo' : 'Nuovo Gruppo'}</DialogTitle>
                        <DialogDescription>
                            Configura i dettagli del gruppo e le regole di sconto stagionali.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto pr-2 space-y-6 py-4">
                        {error && (
                            <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md flex items-center gap-2 border border-destructive/20">
                                <AlertCircle className="h-4 w-4" />
                                {error}
                            </div>
                        )}
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
                                            bundles={formData.bundles?.filter(b => b.season_id === season.id) || []}
                                            onConfigChange={(newConfig) => {
                                                const others = formData.season_configurations?.filter(c => c.season_id !== season.id) || [];
                                                setFormData({
                                                    ...formData,
                                                    season_configurations: [...others, newConfig]
                                                });
                                            }}
                                            onBundleChange={(updatedSeasonBundles) => {
                                                // Remove all bundles for this season from main list
                                                const otherBundles = formData.bundles?.filter(b => b.season_id !== season.id) || [];
                                                // Add updated ones
                                                // Ensure group_id is set
                                                const readyBundles = updatedSeasonBundles.map(b => ({ ...b, group_id: editingGroup?.id || '', season_id: season.id }));

                                                setFormData({
                                                    ...formData,
                                                    bundles: [...otherBundles, ...readyBundles]
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

            <Dialog open={!!deleteConfirmation?.isOpen} onOpenChange={(open) => !open && setDeleteConfirmation(null)}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Conferma Eliminazione</DialogTitle>
                        <DialogDescription>
                            Sei sicuro di voler eliminare il gruppo "{deleteConfirmation?.groupName}"?
                            Questa azione non può essere annullata.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteConfirmation(null)}>Annulla</Button>
                        <Button variant="destructive" onClick={confirmDelete}>Elimina</Button>
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
    bundles,
    onConfigChange,
    onBundleChange
}: {
    season: PricingSeason,
    config: GroupSeasonConfiguration | null,
    bundles: GroupBundle[],
    onConfigChange: (cfg: GroupSeasonConfiguration) => void,
    onBundleChange: (bundles: GroupBundle[]) => void
}) {
    // Determine initial mode
    let initialMode: 'discount' | 'custom' | 'bundle' = 'discount';
    if (bundles && bundles.length > 0) {
        initialMode = 'bundle';
    } else if (config?.custom_rates && Object.keys(config.custom_rates).length > 0) {
        initialMode = 'custom';
    } else if (config?.discount_percentage && config.discount_percentage > 0) {
        initialMode = 'discount';
    }

    const [mode, setMode] = useState<'discount' | 'custom' | 'bundle'>(initialMode);

    // Check if season is "High Season"
    const isHighSeason = season.name.toLowerCase().includes('alta') || season.priority > 10;

    // Helper to get nested value safely
    const getRate = (key: string) => {
        if (!config?.custom_rates) return undefined;
        // @ts-ignore - Dynamic access to optional CustomRates
        return config.custom_rates[key] as number | undefined;
    };

    const updateConfig = (updates: Partial<GroupSeasonConfiguration>) => {
        onConfigChange({
            id: config?.id || crypto.randomUUID(), // Temp ID for new configs
            group_id: config?.group_id || '', // Will be set by backend/context
            season_id: season.id,
            discount_percentage: 0, // Reset by default, overridden if in update
            custom_rates: {},       // Reset by default
            enable_bundle: false,   // Reset by default
            created_at: config?.created_at || new Date().toISOString(),
            updated_at: new Date().toISOString(),
            ...updates
        });
    };

    const handleModeChange = (newMode: string) => {
        if (newMode === 'bundle' && isHighSeason) {
            // Should not happen due to disabled tab, but just in case
            return;
        }

        setMode(newMode as any);

        // When switching, we technically don't need to clear immediately until user inputs data,
        // BUT user requirement says "exclusive... only one can be configured".
        // So switching tab should probably reset the config for this season to be safe/clean?
        // Let's reset on Save/Change? 
        // Actually, better UX: Keep data in memory? 
        // Requirement: "Nel caso l'utente provasse ad inserire più tipologie... avvisato con pop up"
        // If we use Tabs, it implies only one is visible/active.
        // We will ensure `updateConfig` clears others.

        if (newMode === 'bundle') {
            updateConfig({ enable_bundle: true });
        } else if (newMode === 'discount') {
            updateConfig({ discount_percentage: 0 }); // Start with 0
        } else {
            updateConfig({ custom_rates: {} }); // Start clean custom
        }
    };

    const updateDiscount = (val: number) => {
        updateConfig({ discount_percentage: val, enable_bundle: false, custom_rates: {} });
    };

    const updateCustomRate = (key: string, value: string) => {
        const numVal = value === '' ? undefined : parseFloat(value);
        const currentRates = config?.custom_rates || {};
        updateConfig({
            custom_rates: {
                ...currentRates,
                [key]: numVal
            },
            discount_percentage: 0,
            enable_bundle: false
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

            <Tabs value={mode} onValueChange={handleModeChange} className="w-full">
                <TabsList className="grid w-full grid-cols-3 h-8">
                    <TabsTrigger value="discount" className="text-xs">Sconto %</TabsTrigger>
                    <TabsTrigger value="custom" className="text-xs">Tariffe Personal.</TabsTrigger>
                    <TabsTrigger value="bundle" className="text-xs" disabled={isHighSeason}>
                        {isHighSeason ? <span className="text-muted-foreground/50 line-through">Bundle</span> : "Bundle"}
                    </TabsTrigger>
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
                                onChange={(e) => updateDiscount(parseFloat(e.target.value) || 0)}
                                className="pr-6"
                            />
                            <span className="absolute right-2 top-2.5 text-xs text-muted-foreground">%</span>
                        </div>
                        <p className="text-xs text-muted-foreground flex-1">
                            Applicato al totale giornaliero.
                        </p>
                    </div>
                </TabsContent>

                <TabsContent value="custom" className="pt-2 space-y-3">
                    <p className="text-xs text-muted-foreground mb-2">
                        Sovrascrivi i prezzi base.
                    </p>
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                        <div className="space-y-1">
                            <Label className="text-[10px] uppercase text-muted-foreground">Piazzola</Label>
                            <Input type="number" min="1" step="1" placeholder={season.piazzola_price_per_day.toString()} value={getRate('piazzola') ?? ''} onChange={e => updateCustomRate('piazzola', e.target.value)} className="h-8 text-sm" />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-[10px] uppercase text-muted-foreground">Tenda</Label>
                            <Input type="number" min="1" step="1" placeholder={season.tenda_price_per_day.toString()} value={getRate('tenda') ?? ''} onChange={e => updateCustomRate('tenda', e.target.value)} className="h-8 text-sm" />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-[10px] uppercase text-muted-foreground">Persona</Label>
                            <Input type="number" min="1" step="1" placeholder={season.person_price_per_day?.toString() || '0'} value={getRate('person') ?? ''} onChange={e => updateCustomRate('person', e.target.value)} className="h-8 text-sm" />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-[10px] uppercase text-muted-foreground">Bambino</Label>
                            <Input type="number" min="1" step="1" placeholder={season.child_price_per_day?.toString() || '0'} value={getRate('child') ?? ''} onChange={e => updateCustomRate('child', e.target.value)} className="h-8 text-sm" />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-[10px] uppercase text-muted-foreground">Cane</Label>
                            <Input type="number" min="1" step="1" placeholder={season.dog_price_per_day?.toString() || '0'} value={getRate('dog') ?? ''} onChange={e => updateCustomRate('dog', e.target.value)} className="h-8 text-sm" />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-[10px] uppercase text-muted-foreground">Auto</Label>
                            <Input type="number" min="1" step="1" placeholder={season.car_price_per_day?.toString() || '0'} value={getRate('car') ?? ''} onChange={e => updateCustomRate('car', e.target.value)} className="h-8 text-sm" />
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="bundle" className="pt-2">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-muted-foreground">
                                Definisci le offerte a pacchetto per questa stagione ({season.name}).
                            </div>
                            <Button size="sm" variant="outline" onClick={() => {
                                const newBundle: GroupBundle = {
                                    id: crypto.randomUUID(),
                                    group_id: config?.group_id || '',
                                    season_id: season.id,
                                    nights: 1,
                                    pitch_price: 0,
                                    unit_prices: {},
                                    created_at: new Date().toISOString(),
                                    updated_at: new Date().toISOString()
                                };
                                onBundleChange([...bundles, newBundle]);
                            }}>
                                <Plus className="h-4 w-4 mr-2" />
                                Aggiungi Offerta
                            </Button>
                        </div>

                        <div className="space-y-3">
                            {bundles.length === 0 && (
                                <p className="text-sm italic text-muted-foreground">Nessuna offerta configurata per questa stagione.</p>
                            )}
                            {bundles.map((bundle) => (
                                <div key={bundle.id} className="border rounded-md p-3 bg-background relative">
                                    <div className="absolute right-2 top-2">
                                        <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-destructive" onClick={() => {
                                            onBundleChange(bundles.filter(b => b.id !== bundle.id));
                                        }}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <div className="flex flex-wrap gap-4 mb-3 pr-8">
                                        <div className="flex items-center gap-2">
                                            <Label className="text-sm min-w-[40px]">Notti</Label>
                                            <Input
                                                type="number"
                                                min="1"
                                                value={bundle.nights}
                                                onChange={e => {
                                                    const newVal = parseInt(e.target.value) || 1;
                                                    onBundleChange(bundles.map(b => b.id === bundle.id ? { ...b, nights: newVal } : b));
                                                }}
                                                className="w-16 h-8"
                                            />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Label className="text-sm whitespace-nowrap">Prezzo Piazzola Base €</Label>
                                            <Input
                                                type="number"
                                                min="0"
                                                step="1"
                                                value={bundle.pitch_price}
                                                onChange={e => {
                                                    const newVal = parseFloat(e.target.value) || 0;
                                                    onBundleChange(bundles.map(b => b.id === bundle.id ? { ...b, pitch_price: newVal } : b));
                                                }}
                                                className="w-20 h-8 font-semibold"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-xs font-semibold text-muted-foreground">Prezzi Pacchetto per Servizi Aggiuntivi (Lascia vuoto per prezzo standard)</Label>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                            {['dog', 'car'].map(service => (
                                                <div key={service} className="flex flex-col space-y-1">
                                                    <Label className="text-[10px] uppercase text-muted-foreground">
                                                        {service === 'person' ? 'Persona' :
                                                            service === 'child' ? 'Bambino' :
                                                                service === 'dog' ? 'Cane' :
                                                                    service === 'car' ? 'Auto' : service}
                                                    </Label>
                                                    <div className="relative">
                                                        <Input
                                                            type="number"
                                                            min="0"
                                                            step="1"
                                                            placeholder="Standard"
                                                            value={bundle.unit_prices?.[service] !== undefined ? bundle.unit_prices[service] : ''}
                                                            onChange={(e) => {
                                                                const val = e.target.value === '' ? undefined : parseFloat(e.target.value);
                                                                const currentUnits = bundle.unit_prices || {};
                                                                if (val === undefined) {
                                                                    const { [service]: _, ...rest } = currentUnits;
                                                                    onBundleChange(bundles.map(b => b.id === bundle.id ? { ...b, unit_prices: rest } : b));
                                                                } else {
                                                                    onBundleChange(bundles.map(b => b.id === bundle.id ? { ...b, unit_prices: { ...currentUnits, [service]: val } } : b));
                                                                }
                                                            }}
                                                            className="h-7 text-xs pr-6"
                                                        />
                                                        <span className="absolute right-2 top-1.5 text-[10px] text-muted-foreground">€</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
