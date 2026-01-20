'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Search, UserCheck, Loader2, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export function DemoCheckInWidget() {
    const [step, setStep] = useState<'search' | 'details' | 'success'>('search');
    const [loading, setLoading] = useState(false);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            setStep('details');
        }, 800);
    };

    const handleConfirm = () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            setStep('success');
            toast.success("Check-in Simulato completato!");
        }, 1000);
    };

    const reset = () => {
        setStep('search');
    };

    return (
        <Card className="w-full border shadow-lg overflow-hidden flex flex-col min-h-[400px]">
            {step === 'search' && (
                <div className="flex-1 p-6 flex flex-col justify-center animate-in fade-in zoom-in-95 duration-300">
                    <div className="text-center mb-6 space-y-2">
                        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-2">
                            <Search className="w-6 h-6" />
                        </div>
                        <h3 className="font-bold text-lg">Cerca Prenotazione</h3>
                        <p className="text-sm text-muted-foreground">Prova a cercare "Mario Rossi"</p>
                    </div>
                    <form onSubmit={handleSearch} className="space-y-4">
                        <Input
                            placeholder="Cognome o Numero Prenotazione"
                            defaultValue="Rossi"
                            className="text-center text-lg h-12 bg-background border-input font-medium"
                        />
                        <Button type="submit" className="w-full h-12 text-base" disabled={loading}>
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Cerca"}
                        </Button>
                    </form>
                </div>
            )}

            {step === 'details' && (
                <div className="flex-1 flex flex-col bg-background animate-in slide-in-from-right duration-300">
                    <div className="p-4 border-b bg-muted/20">
                        <div className="flex justify-between items-start">
                            <div>
                                <h4 className="font-bold">Mario Rossi</h4>
                                <p className="text-xs text-muted-foreground">Piazzola 12 • 2 Ospiti</p>
                            </div>
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                Confermato
                            </Badge>
                        </div>
                    </div>
                    <div className="p-4 space-y-4 flex-1 overflow-auto bg-background">
                        <div className="space-y-2">
                            <Label className="text-xs font-semibold">Documento d'Identità</Label>
                            <select className="w-full text-base border rounded-md p-2 bg-background">
                                <option>Carta d'Identità</option>
                                <option>Passaporto</option>
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                                <Label className="text-xs font-semibold">Numero</Label>
                                <Input placeholder="AX123..." defaultValue="AX89233" className="h-9 text-base bg-background" />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs font-semibold">Scadenza</Label>
                                <Input type="date" className="h-9 text-base bg-background" />
                            </div>
                        </div>
                    </div>
                    <div className="p-4 border-t bg-muted/20 mt-auto">
                        <Button onClick={handleConfirm} className="w-full" disabled={loading}>
                            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <UserCheck className="w-4 h-4 mr-2" />}
                            Conferma Check-in
                        </Button>
                        <Button variant="ghost" size="sm" onClick={reset} className="w-full mt-2 h-8 text-xs">Indietro</Button>
                    </div>
                </div>
            )}

            {step === 'success' && (
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center animate-in zoom-in duration-300 bg-background">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-green-700 mb-2">Check-in Completato!</h3>
                    <p className="text-sm text-muted-foreground mb-6">
                        I dati sono stati salvati e la schedina alloggiati è pronta per l'invio.
                    </p>
                    <Button onClick={reset} variant="outline">Nuovo Check-in</Button>
                </div>
            )}
        </Card>
    );
}
