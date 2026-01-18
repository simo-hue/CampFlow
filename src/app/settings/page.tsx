'use client';

import { useState, useEffect } from 'react';
import { SettingsLayout } from '@/components/settings/SettingsLayout';
import { PitchManagement } from '@/components/settings/PitchManagement';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Save, Check } from 'lucide-react';

interface PricingSettings {
    person_price_per_day: number;
    dog_price_per_day: number;
    tent_price_per_day: number;
    pitch_price_per_day: number;
}

const DEFAULT_PRICING: PricingSettings = {
    person_price_per_day: 10,
    dog_price_per_day: 5,
    tent_price_per_day: 15,
    pitch_price_per_day: 25,
};

export default function SettingsPage() {
    const [activeSection, setActiveSection] = useState('campeggio');
    const [isSaved, setIsSaved] = useState(false);

    // Dark mode state
    const [darkMode, setDarkMode] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('darkMode');
            return saved === 'true';
        }
        return false;
    });

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

    // Auto-save dark mode
    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('darkMode', darkMode.toString());
    }, [darkMode]);

    // Manual Save Pricing
    const savePricing = () => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('pricing', JSON.stringify(pricing));
            setIsSaved(true);
            setTimeout(() => setIsSaved(false), 2000);
        }
    };

    const updatePricing = (field: keyof PricingSettings, value: string) => {
        const numValue = parseFloat(value) || 0;
        setPricing((prev) => ({ ...prev, [field]: numValue }));
        setIsSaved(false);
    };

    return (
        <SettingsLayout activeSection={activeSection} onSectionChange={setActiveSection}>
            {/* Campeggio Section */}
            {activeSection === 'campeggio' && (
                <div>
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold">Gestione Campeggio</h2>
                        <p className="text-muted-foreground mt-1">
                            Configura piazzole, tende e strutture del campeggio
                        </p>
                    </div>
                    <PitchManagement />
                </div>
            )}

            {/* Prezzi Section */}
            {activeSection === 'prezzi' && (
                <div>
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold">Gestione Prezzi</h2>
                        <p className="text-muted-foreground mt-1">
                            Configura le tariffe giornaliere per persone, animali e strutture
                        </p>
                    </div>

                    <div className="space-y-6 w-full">
                        {/* Prezzo Persona */}
                        <div className="grid gap-2">
                            <Label htmlFor="person-price">Persona (€/giorno)</Label>
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
                            <Label htmlFor="dog-price">Cane (€/giorno)</Label>
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

                        {/* Prezzo Tenda */}
                        <div className="grid gap-2">
                            <Label htmlFor="tent-price">Tenda (€/giorno)</Label>
                            <Input
                                id="tent-price"
                                type="number"
                                min="0"
                                step="0.5"
                                value={pricing.tent_price_per_day}
                                onChange={(e) => updatePricing('tent_price_per_day', e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">
                                Costo base per tenda al giorno
                            </p>
                        </div>

                        {/* Prezzo Piazzola */}
                        <div className="grid gap-2">
                            <Label htmlFor="pitch-price">Piazzola (€/giorno)</Label>
                            <Input
                                id="pitch-price"
                                type="number"
                                min="0"
                                step="0.5"
                                value={pricing.pitch_price_per_day}
                                onChange={(e) => updatePricing('pitch_price_per_day', e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">
                                Costo base per piazzola al giorno
                            </p>
                        </div>

                        {/* Example Calculation */}
                        <div className="p-4 border rounded-lg bg-muted">
                            <p className="text-sm font-medium mb-2">📊 Esempio di calcolo:</p>
                            <p className="text-sm text-muted-foreground">
                                2 persone + 1 cane + piazzola per 3 giorni =<br />
                                (2 × {pricing.person_price_per_day}€ + 1 × {pricing.dog_price_per_day}€ + {pricing.pitch_price_per_day}€) × 3 giorni =
                                <strong className="ml-1">
                                    {((2 * pricing.person_price_per_day + pricing.dog_price_per_day + pricing.pitch_price_per_day) * 3).toFixed(2)}€
                                </strong>
                            </p>
                        </div>

                        {/* Save Button */}
                        <div className="flex justify-end pt-4">
                            <Button onClick={savePricing} className="w-full sm:w-auto" disabled={isSaved}>
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
                                checked={darkMode}
                                onCheckedChange={setDarkMode}
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
        </SettingsLayout>
    );
}
