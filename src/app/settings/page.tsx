'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { SettingsLayout } from '@/components/settings/SettingsLayout';
import { PitchManagement } from '@/components/settings/PitchManagement';
import { SectorManagement } from '@/components/settings/SectorManagement';
import { SeasonalPricingManager } from '@/components/settings/SeasonalPricingManager';
import { GroupManagement } from '@/components/settings/GroupManagement';
import { DeveloperPanel } from '@/components/settings/DeveloperPanel';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, Check } from 'lucide-react';

interface PricingSettings {
    person_price_per_day: number;
    dog_price_per_day: number;
    car_price_per_day: number;
    child_price_per_day: number;
    child_age_max: number;
}

const DEFAULT_PRICING: PricingSettings = {
    person_price_per_day: 10,
    dog_price_per_day: 5,
    car_price_per_day: 5,
    child_price_per_day: 5,
    child_age_max: 12,
};

export default function SettingsPage() {
    const { theme, setTheme } = useTheme();
    const [activeSection, setActiveSection] = useState('campeggio');
    const [isSaved, setIsSaved] = useState(false);

    // Pricing state
    const [pricing, setPricing] = useState<PricingSettings>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('pricing');
            if (saved) {
                return JSON.parse(saved);
            }
        }
        return DEFAULT_PRICING;
    });

    // Track saved pricing state for dirty checking
    const [savedPricing, setSavedPricing] = useState<PricingSettings>(pricing);

    // Initial load effect to sync savedPricing with localStorage if available
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('pricing');
            if (saved) {
                const parsed = JSON.parse(saved);
                setPricing(parsed);
                setSavedPricing(parsed);
            }
        }
    }, []);

    // Manual Save Pricing
    const savePricing = () => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('pricing', JSON.stringify(pricing));
            setSavedPricing(pricing);
            setIsSaved(true);
            setTimeout(() => setIsSaved(false), 2000);
        }
    };

    const updatePricing = (field: keyof PricingSettings, value: string) => {
        const numValue = parseFloat(value) || 0;
        setPricing((prev) => ({ ...prev, [field]: numValue }));
        setIsSaved(false);
    };

    const isDirty = JSON.stringify(pricing) !== JSON.stringify(savedPricing);

    return (
        <SettingsLayout activeSection={activeSection} onSectionChange={setActiveSection}>
            {/* Campeggio Section */}
            {activeSection === 'campeggio' && (
                <div>
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold">Gestione Campeggio</h2>
                        <p className="text-muted-foreground mt-1">
                            Configura il tuo campeggio
                        </p>
                    </div>
                    <Tabs defaultValue="pitches" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 max-w-[400px] mb-4 mx-auto">
                            <TabsTrigger value="pitches">Piazzole</TabsTrigger>
                            <TabsTrigger value="sectors">Settori</TabsTrigger>
                        </TabsList>
                        <TabsContent value="pitches">
                            <PitchManagement />
                        </TabsContent>
                        <TabsContent value="sectors">
                            <SectorManagement />
                        </TabsContent>
                    </Tabs>
                </div>
            )}

            {/* Prezzi Section */}
            {activeSection === 'prezzi' && (
                <div>
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold">Gestione Prezzi</h2>
                        <p className="text-muted-foreground mt-1">
                            Configura le tariffe giornaliere per persone, animali e stagionalità
                        </p>
                    </div>

                    <div className="space-y-6 w-full">
                        {/* Età Massima Bambino */}
                        <div className="grid gap-2">
                            <Label htmlFor="child-age">Età Massima Bambino (anni)</Label>
                            <Input
                                id="child-age"
                                type="number"
                                min="0"
                                max="17"
                                step="1"
                                value={pricing.child_age_max}
                                onChange={(e) => updatePricing('child_age_max', e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">
                                Età massima (inclusa) per essere considerato bambino. Oltre questa età verrà applicata la tariffa persona.
                            </p>
                        </div>

                        <div className="my-4 border-t" />

                        {/* Seasonal Pricing Manager */}
                        <SeasonalPricingManager />
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-end pt-4">
                        <Button
                            onClick={savePricing}
                            className="w-full sm:w-auto"
                            disabled={!isDirty || isSaved}
                        >
                            {isSaved ? (
                                <>
                                    <Check className="mr-2 h-4 w-4" />
                                    Modifiche Salvate
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Salva Modifiche
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            )}

            {/* Gruppi Section */}
            {activeSection === 'gruppi' && (
                <div>
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold">Gestione Gruppi</h2>
                        <p className="text-muted-foreground mt-1">
                            Configura gruppi clienti e sconti stagionali
                        </p>
                    </div>
                    <GroupManagement />
                </div>
            )}

            {/* Aspetto Section */}
            {activeSection === 'aspetto' && (
                <div>
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold">Aspetto</h2>
                        <p className="text-muted-foreground mt-1">
                            Personalizza l&apos;aspetto dell&apos;applicazione
                        </p>
                    </div>

                    <div className="w-full">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
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
                                checked={theme === 'dark'}
                                onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                            />
                        </div>

                        <div className="mt-4 p-4 border rounded-lg bg-muted/50">
                            <p className="text-sm text-muted-foreground">
                                💡 <strong>Suggerimento:</strong> La modalità scura verrà applicata immediatamente e salvata automaticamente.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Developer Section */}
            {activeSection === 'dev' && (
                <div>
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold">Developer Tools</h2>
                        <p className="text-muted-foreground mt-1">
                            Database statistics, logs, and maintenance tools
                        </p>
                    </div>
                    <DeveloperPanel />
                </div>
            )}
        </SettingsLayout>
    );
}
