'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
    ArrowLeft,
    MapPin,
    CreditCard,
    User,
    Save,
    Loader2,
    Shield,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useCustomerGroups } from '@/hooks/useCustomerGroups';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

// Type definition for form data
type CustomerFormData = {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    notes: string;

    // Anagrafica Nascita
    birth_date: string;
    birth_city: string;
    birth_province: string;
    gender: string;

    // Residenza
    address: string;
    residence_city: string;
    residence_zip: string;
    residence_province: string;
    residence_country: string;

    // Documenti
    document_type: string;
    document_number: string;
    document_issue_date: string;
    document_issuer: string;

    // Veicolo
    license_plate: string;

    // Gruppo
    group_id?: string;
};

export default function NewCustomerPage() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { groups } = useCustomerGroups();

    const [formData, setFormData] = useState<CustomerFormData>({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        notes: '',
        birth_date: '',
        birth_city: '',
        birth_province: '',
        gender: '',
        address: '',
        residence_city: '',
        residence_zip: '',
        residence_province: '',
        residence_country: '',
        document_type: '',
        document_number: '',
        document_issue_date: '',
        document_issuer: '',
        license_plate: '',
        group_id: undefined
    });

    const createCustomerMutation = useMutation({
        mutationFn: async (newCustomerData: CustomerFormData) => {
            // Filter out empty strings to send cleaner data or handle logic in API
            // The API likely handles insertion. We need to respect the types.

            const payload = {
                ...newCustomerData,
                // Handle optional group_id
                group_id: newCustomerData.group_id === 'none' ? null : newCustomerData.group_id
            };

            const res = await fetch('/api/customers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Failed to create customer');
            }
            return res.json();
        },
        onSuccess: (data) => {
            toast.success('Cliente creato con successo');
            queryClient.invalidateQueries({ queryKey: ['customers'] });
            // Navigate to the new customer's detail page
            router.push(`/customers/${data.id}`);
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });

    const handleSave = () => {
        if (!formData.first_name || !formData.last_name) {
            toast.error('Nome e Cognome sono obbligatori');
            return;
        }
        createCustomerMutation.mutate(formData);
    };

    const handleInputChange = (field: keyof CustomerFormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    }

    return (
        <div className="flex flex-col bg-muted/10 p-4 md:p-8 gap-6 min-h-screen">

            {/* Header: Navigation - Centered */}
            <div className="flex flex-col items-center justify-center text-center gap-2 shrink-0">
                <div className="space-y-1">
                    <Link href="/customers" className='text-sm text-muted-foreground hover:text-foreground flex items-center justify-center gap-1 mb-2'>
                        <ArrowLeft className="h-3 w-3" /> Torna alla lista
                    </Link>
                    <h1 className="text-3xl font-bold tracking-tight">Nuovo Cliente</h1>
                    <p className="text-muted-foreground text-sm">Inserisci i dati del nuovo ospite</p>
                </div>
            </div>

            {/* Main Content Form */}
            <div className="flex-1 w-full max-w-5xl mx-auto mt-0">
                <Card className="flex flex-col border shadow-sm bg-card">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                        <div>
                            <CardTitle>Dati Anagrafici</CardTitle>
                            <CardDescription>Compila la scheda completa del cliente.</CardDescription>
                        </div>
                    </CardHeader>
                    <Separator />

                    <CardContent className="p-6 md:p-8 space-y-6 w-full">
                        {/* Section: Anagrafica & Contatti (Blue) */}
                        <div className="rounded-xl border border-blue-200/50 bg-blue-50/50 dark:bg-blue-950/20 dark:border-blue-900/50 p-6 space-y-4">
                            <h3 className="font-semibold flex items-center gap-2 text-blue-700 dark:text-blue-400 text-sm uppercase tracking-wide">
                                <User className="h-4 w-4" /> Anagrafica e Contatti
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-foreground font-medium">Nome *</Label>
                                    <Input className="bg-background/80" value={formData.first_name} onChange={e => handleInputChange('first_name', e.target.value)} placeholder="Mario" required />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-foreground font-medium">Cognome *</Label>
                                    <Input className="bg-background/80" value={formData.last_name} onChange={e => handleInputChange('last_name', e.target.value)} placeholder="Rossi" required />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-muted-foreground">Email</Label>
                                    <Input className="bg-background/80" value={formData.email} onChange={e => handleInputChange('email', e.target.value)} placeholder="mario.rossi@example.com" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-muted-foreground">Telefono</Label>
                                    <Input className="bg-background/80" value={formData.phone} onChange={e => handleInputChange('phone', e.target.value)} placeholder="+39 333 1234567" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-muted-foreground">Data di Nascita</Label>
                                    <Input className="bg-background/80" type="date" value={formData.birth_date} onChange={e => handleInputChange('birth_date', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-muted-foreground">Sesso</Label>
                                    <Input className="bg-background/80" value={formData.gender} onChange={e => handleInputChange('gender', e.target.value)} placeholder="M/F" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-muted-foreground">Gruppo Cliente</Label>
                                    <Select
                                        value={formData.group_id}
                                        onValueChange={(val) => handleInputChange('group_id', val)}
                                    >
                                        <SelectTrigger className="bg-background/80">
                                            <SelectValue placeholder="Seleziona gruppo..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">Nessun Gruppo</SelectItem>
                                            {groups.map(group => (
                                                <SelectItem key={group.id} value={group.id}>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: group.color }} />
                                                        {group.name}
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6 pt-2">
                                <div className="space-y-2">
                                    <Label className="text-muted-foreground">Comune Nascita</Label>
                                    <Input className="bg-background/80" value={formData.birth_city} onChange={e => handleInputChange('birth_city', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-muted-foreground">Provincia</Label>
                                    <Input className="bg-background/80" value={formData.birth_province} onChange={e => handleInputChange('birth_province', e.target.value)} />
                                </div>
                            </div>
                        </div>

                        {/* Section: Residenza (Amber/Orange) */}
                        <div className="rounded-xl border border-amber-200/50 bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-900/50 p-6 space-y-4">
                            <h3 className="font-semibold flex items-center gap-2 text-amber-700 dark:text-amber-500 text-sm uppercase tracking-wide">
                                <MapPin className="h-4 w-4" /> Residenza
                            </h3>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-muted-foreground">Indirizzo</Label>
                                    <Input className="bg-background/80" value={formData.address} onChange={e => handleInputChange('address', e.target.value)} placeholder="Via Roma, 1" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="md:col-span-1 space-y-2">
                                        <Label className="text-muted-foreground">CAP</Label>
                                        <Input className="bg-background/80" value={formData.residence_zip} onChange={e => handleInputChange('residence_zip', e.target.value)} />
                                    </div>
                                    <div className="md:col-span-2 space-y-2">
                                        <Label className="text-muted-foreground">Città</Label>
                                        <Input className="bg-background/80" value={formData.residence_city} onChange={e => handleInputChange('residence_city', e.target.value)} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-muted-foreground">Provincia</Label>
                                        <Input className="bg-background/80" value={formData.residence_province} onChange={e => handleInputChange('residence_province', e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-muted-foreground">Stato</Label>
                                        <Input className="bg-background/80" value={formData.residence_country} onChange={e => handleInputChange('residence_country', e.target.value)} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section: Documenti (Emerald/Green) */}
                        <div className="rounded-xl border border-emerald-200/50 bg-emerald-50/50 dark:bg-emerald-950/20 dark:border-emerald-900/50 p-6 space-y-4">
                            <h3 className="font-semibold flex items-center gap-2 text-emerald-700 dark:text-emerald-500 text-sm uppercase tracking-wide">
                                <Shield className="h-4 w-4" /> Documento d'Identità
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-muted-foreground">Tipo</Label>
                                    <Input className="bg-background/80" value={formData.document_type} onChange={e => handleInputChange('document_type', e.target.value)} placeholder="carta_identita" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-muted-foreground">Numero</Label>
                                    <Input className="bg-background/80" value={formData.document_number} onChange={e => handleInputChange('document_number', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-muted-foreground">Rilasciato da</Label>
                                    <Input className="bg-background/80" value={formData.document_issuer} onChange={e => handleInputChange('document_issuer', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-muted-foreground">Data Rilascio</Label>
                                    <Input className="bg-background/80" type="date" value={formData.document_issue_date} onChange={e => handleInputChange('document_issue_date', e.target.value)} />
                                </div>
                            </div>
                        </div>

                        {/* Section: Veicolo (Indigo/Purple) */}
                        <div className="rounded-xl border border-indigo-200/50 bg-indigo-50/50 dark:bg-indigo-950/20 dark:border-indigo-900/50 p-6 space-y-4">
                            <h3 className="font-semibold flex items-center gap-2 text-indigo-700 dark:text-indigo-400 text-sm uppercase tracking-wide">
                                <CreditCard className="h-4 w-4" /> Veicolo
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-muted-foreground">Targa</Label>
                                    <Input
                                        className="bg-background/80 uppercase font-mono"
                                        value={formData.license_plate}
                                        onChange={e => handleInputChange('license_plate', e.target.value.toUpperCase())}
                                        placeholder="AA000AA"
                                    />
                                    <p className="text-[10px] text-muted-foreground">Necessaria per l'accesso automatico.</p>
                                </div>
                            </div>
                        </div>

                        {/* Note Interne (Gray/Default) */}
                        <div className="rounded-xl border bg-muted/30 p-6 space-y-4">
                            <Label className="text-muted-foreground font-semibold">Note Interne</Label>
                            <Input className="bg-background/80" value={formData.notes} onChange={e => handleInputChange('notes', e.target.value)} placeholder="Note visibili solo allo staff..." />
                        </div>
                    </CardContent>

                    <CardFooter className="bg-muted/10 border-t flex justify-end py-4 px-8 mt-auto sticky bottom-0 z-10 backdrop-blur-md">
                        <Button variant="outline" className="mr-4" onClick={() => router.push('/customers')}>
                            Annulla
                        </Button>
                        <Button className="min-w-[150px]" onClick={handleSave} disabled={createCustomerMutation.isPending}>
                            {createCustomerMutation.isPending ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2 h-4 w-4" />}
                            Crea Cliente
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
