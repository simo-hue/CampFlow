'use client';

import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings } from 'lucide-react';
import { PitchManagement } from '@/components/settings/PitchManagement';
import { SeasonalPricingManager } from '@/components/settings/SeasonalPricingManager';

interface PricingSettings {
    person_price_per_day: number;
    dog_price_per_day: number;
}

const DEFAULT_PRICING: PricingSettings = {
    person_price_per_day: 10,
    dog_price_per_day: 5,
};

export function SettingsDialog() {
    const [open, setOpen] = useState(false);

    // Initialize dark mode from localStorage
    const [darkMode, setDarkMode] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('darkMode');
            return saved === 'true';
        }
        return false;
    });

    // Initialize pricing from localStorage
    const [pricing, setPricing] = useState<PricingSettings>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('pricing');
            if (saved) {
                return JSON.parse(saved);
            }
        }
        return DEFAULT_PRICING;
    });

    const [saving, setSaving] = useState(false);

    const saveSettings = () => {
        setSaving(true);

        // Save to localStorage
        localStorage.setItem('darkMode', darkMode.toString());
        localStorage.setItem('pricing', JSON.stringify(pricing));

        // TODO: In futuro, salvare anche su Supabase
        // await supabase.from('settings').upsert({ dark_mode: darkMode, pricing })

        setTimeout(() => {
            setSaving(false);
            setOpen(false);
        }, 500);
    };

    const updatePricing = (field: keyof PricingSettings, value: string) => {
        const numValue = parseFloat(value) || 0;
        setPricing((prev) => ({ ...prev, [field]: numValue }));
    };

    // Apply dark mode to document
    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [darkMode]);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" title="Impostazioni">
                    <Settings className="h-5 w-5" />
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Impostazioni</DialogTitle>
                    <DialogDescription>
                        Configura l&apos;aspetto e i prezzi del sistema
                    </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="appearance" className="mt-4">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="appearance">Aspetto</TabsTrigger>
                        <TabsTrigger value="pricing">Prezzi</TabsTrigger>
                        <TabsTrigger value="campeggio">Campeggio</TabsTrigger>
                    </TabsList>

                    {/* Aspetto Tab */}
                    <TabsContent value="appearance" className="space-y-4 mt-4">
                        <div className="flex items-center justify-between p-4 border rounded-md">
                            <div className="space-y-0.5">
                                <Label htmlFor="dark-mode" className="text-base font-medium">
                                    Modalità Scura
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                    Attiva il tema scuro per ridurre l&apos;affaticamento visivo
                                </p>
                            </div>
                            <Switch
                                id="dark-mode"
                                checked={darkMode}
                                onCheckedChange={setDarkMode}
                            />
                        </div>

                        <div className="p-4 border rounded-md bg-muted/50">
                            <p className="text-sm text-muted-foreground">
                                💡 <strong>Suggerimento:</strong> La modalità scura verrà applicata immediatamente e salvata automaticamente.
                            </p>
                        </div>
                    </TabsContent>

                    {/* Prezzi Tab */}
                    <TabsContent value="pricing" className="space-y-4 mt-4">
                        {/* Prezzo Persona */}
                        <div className="grid gap-2">
                            <Label htmlFor="person-price">Prezzo Persona (€/giorno)</Label>
                            <Input
                                id="person-price"
                                type="number"
                                min="0"
                                step="0.5"
                                value={pricing.person_price_per_day}
                                onChange={(e) => updatePricing('person_price_per_day', e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">
                                Costo per persona al giorno
                            </p>
                        </div>

                        {/* Prezzo Cane */}
                        <div className="grid gap-2">
                            <Label htmlFor="dog-price">Prezzo Cane (€/giorno)</Label>
                            <Input
                                id="dog-price"
                                type="number"
                                min="0"
                                step="0.5"
                                value={pricing.dog_price_per_day}
                                onChange={(e) => updatePricing('dog_price_per_day', e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">
                                Costo per cane al giorno
                            </p>
                        </div>

                        <div className="my-4 border-t" />

                        {/* Seasonal Pricing Manager */}
                        <SeasonalPricingManager />
                    </TabsContent>

                    {/* Campeggio Tab */}
                    <TabsContent value="campeggio" className="mt-4">
                        <PitchManagement />
                    </TabsContent>
                </Tabs>

                {/* Actions */}
                <div className="flex justify-end gap-2 mt-6">
                    <Button variant="outline" onClick={() => setOpen(false)}>
                        Annulla
                    </Button>
                    <Button onClick={saveSettings} disabled={saving}>
                        {saving ? 'Salvataggio...' : 'Salva Modifiche'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
