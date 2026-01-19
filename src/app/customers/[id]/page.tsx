'use client';

import { use, useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    ArrowLeft,
    Calendar,
    Mail,
    Phone,
    MapPin,
    CreditCard,
    User,
    Save,
    Loader2,
    Shield,
    Pencil,
    X,
    Check,
    FileText,
    History
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { toast } from 'sonner';

// Types
type Customer = {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    notes: string;
    created_at: string;

    // Anagrafica Nascita
    birth_date?: string;
    birth_place?: string; // We might want separate city/country if DB has them. Previous Edit showed them.
    birth_city?: string;
    birth_province?: string;
    birth_country?: string;
    gender?: string;
    citizenship?: string;

    // Residenza
    address?: string;
    residence_city?: string;
    residence_zip?: string;
    residence_province?: string;
    residence_country?: string;

    // Documenti
    document_type?: string;
    document_number?: string;
    document_issue_date?: string;
    document_issuer?: string;
    document_issue_city?: string;
    document_issue_country?: string;

    [key: string]: any;
};

type Booking = {
    id: string;
    created_at: string;
    start: Date | null;
    end: Date | null;
    booking_period: string;
    status: string;
    total_price: number;
    questura_sent: boolean;
    pitch: {
        number: string;
        type: string;
    };
    guests: any[];
};

const parseBookingPeriod = (period: string) => {
    if (!period) return { start: null, end: null };
    try {
        const clean = period.replace(/[\[\]\(\)]/g, '');
        const [startStr, endStr] = clean.split(',');
        return {
            start: new Date(startStr),
            end: new Date(endStr)
        };
    } catch (e) {
        return { start: null, end: null };
    }
};

export default function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const queryClient = useQueryClient();
    const [isEditing, setIsEditing] = useState(false);

    // Form state
    const [formData, setFormData] = useState<Partial<Customer>>({});

    const { data, isLoading, error } = useQuery({
        queryKey: ['customer', id],
        queryFn: async () => {
            const res = await fetch(`/api/customers/${id}`);
            if (!res.ok) throw new Error('Failed to fetch customer');
            const json = await res.json();

            // Transform bookings to include parsed dates
            const bookings = (json.bookings || []).map((b: any) => {
                const { start, end } = parseBookingPeriod(b.booking_period);
                return { ...b, start, end };
            });

            return { customer: json.customer, bookings };
        },
    });

    // Sync formData when data loads
    useEffect(() => {
        if (data?.customer) {
            setFormData(data.customer);
        }
    }, [data]);

    const updateCustomerMutation = useMutation({
        mutationFn: async (updatedData: Partial<Customer>) => {
            const res = await fetch(`/api/customers/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedData),
            });
            if (!res.ok) throw new Error('Failed to update');
            return res.json();
        },
        onSuccess: () => {
            toast.success('Cliente aggiornato con successo');
            queryClient.invalidateQueries({ queryKey: ['customer', id] });
            setIsEditing(false);
        },
        onError: () => {
            toast.error('Errore durante l\'aggiornamento');
        },
    });

    const updateBookingQuesturaMutation = useMutation({
        mutationFn: async ({ bookingId, sent }: { bookingId: string, sent: boolean }) => {
            const res = await fetch(`/api/bookings/${bookingId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ questura_sent: sent }),
            });
            if (!res.ok) throw new Error('Failed to update booking');
            return res.json();
        },
        onSuccess: () => {
            toast.success('Stato Questura aggiornato');
            queryClient.invalidateQueries({ queryKey: ['customer', id] });
        },
    });

    if (isLoading) return <div className="h-screen w-full flex items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;
    if (error) return <div className="p-10 text-center text-red-500">Errore caricamento cliente</div>;

    const { customer, bookings } = data;
    const totalBookings = bookings.length;
    const totalSpent = bookings.reduce((acc: number, b: Booking) => acc + (b.total_price || 0), 0);

    const handleSave = () => {
        updateCustomerMutation.mutate(formData);
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const StatCard = ({ label, value, icon: Icon }: { label: string, value: string | number, icon: any }) => (
        <div className="flex items-center gap-4 bg-card p-4 rounded-xl border shadow-sm">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Icon className="h-5 w-5" />
            </div>
            <div>
                <p className="text-sm font-medium text-muted-foreground">{label}</p>
                <p className="text-xl font-bold">{value}</p>
            </div>
        </div>
    );

    return (
        <div className="h-[calc(100vh-4rem)] flex flex-col md:flex-row overflow-hidden bg-muted/10">
            {/* Header Mobile Only (if needed, but usually header is global) */}

            {/* Left Column: Profile & Edit Form - Scrollable on mobile, Fixed/Scrollable Sidebar on Desktop */}
            <div className="w-full md:w-[500px] lg:w-[600px] flex flex-col h-full border-r bg-background/50 backdrop-blur-sm z-10 overflow-y-auto">
                <div className="p-6 space-y-6">
                    {/* Header Section */}
                    <div className="flex items-start justify-between">
                        <div className="space-y-1">
                            <Link href="/customers" className='text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mb-2'>
                                <ArrowLeft className="h-3 w-3" /> Torna alla lista
                            </Link>
                            <h1 className="text-2xl font-bold tracking-tight">{customer.first_name} {customer.last_name}</h1>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Badge variant="secondary" className="font-normal">
                                    Cliente dal {format(new Date(customer.created_at), 'MMM yyyy', { locale: it })}
                                </Badge>
                            </div>
                        </div>
                        <Button
                            variant={isEditing ? "destructive" : "secondary"}
                            size="sm"
                            onClick={() => setIsEditing(!isEditing)}
                        >
                            {isEditing ? <X className="h-4 w-4 mr-2" /> : <Pencil className="h-4 w-4 mr-2" />}
                            {isEditing ? 'Annulla' : 'Modifica'}
                        </Button>
                    </div>

                    {/* Quick Stats Row */}
                    <div className="grid grid-cols-2 gap-3">
                        <StatCard label="Prenotazioni" value={totalBookings} icon={History} />
                        <StatCard label="Totale Speso" value={`€ ${totalSpent.toFixed(2)}`} icon={CreditCard} />
                    </div>

                    <Separator />

                    {/* Main Detail Form/View */}
                    <div className="space-y-6">
                        {/* Section: Contatti & Info Base */}
                        <section className="space-y-4">
                            <h3 className="font-semibold flex items-center gap-2 text-primary">
                                <User className="h-4 w-4" /> Anagrafica e Contatti
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Nome</Label>
                                    <Input disabled={!isEditing} value={formData.first_name || ''} onChange={e => handleInputChange('first_name', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Cognome</Label>
                                    <Input disabled={!isEditing} value={formData.last_name || ''} onChange={e => handleInputChange('last_name', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Email</Label>
                                    <Input disabled={!isEditing} value={formData.email || ''} onChange={e => handleInputChange('email', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Telefono</Label>
                                    <Input disabled={!isEditing} value={formData.phone || ''} onChange={e => handleInputChange('phone', e.target.value)} />
                                </div>

                                {/* Dati Nascita - Only show inputs if editing or if value exists */}
                                {(isEditing || formData.birth_date) && (
                                    <div className="space-y-2">
                                        <Label>Data di Nascita</Label>
                                        <Input type="date" disabled={!isEditing} value={formData.birth_date ? format(new Date(formData.birth_date), 'yyyy-MM-dd') : ''} onChange={e => handleInputChange('birth_date', e.target.value)} />
                                    </div>
                                )}
                                {(isEditing || formData.gender) && (
                                    <div className="space-y-2">
                                        <Label>Sesso</Label>
                                        <Input disabled={!isEditing} value={formData.gender || ''} onChange={e => handleInputChange('gender', e.target.value)} placeholder="M/F" />
                                    </div>
                                )}
                            </div>

                            {(isEditing || formData.birth_city) && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Comune Nascita</Label>
                                        <Input disabled={!isEditing} value={formData.birth_city || ''} onChange={e => handleInputChange('birth_city', e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Provincia</Label>
                                        <Input disabled={!isEditing} value={formData.birth_province || ''} onChange={e => handleInputChange('birth_province', e.target.value)} />
                                    </div>
                                </div>
                            )}
                        </section>

                        <Separator />

                        {/* Section: Residenza */}
                        <section className="space-y-4">
                            <h3 className="font-semibold flex items-center gap-2 text-primary">
                                <MapPin className="h-4 w-4" /> Residenza
                            </h3>
                            <div className="space-y-3">
                                <div className="space-y-2">
                                    <Label>Indirizzo</Label>
                                    <Input disabled={!isEditing} value={formData.address || ''} onChange={e => handleInputChange('address', e.target.value)} placeholder="Via Roma, 1" />
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    <div className="col-span-1 space-y-2">
                                        <Label>CAP</Label>
                                        <Input disabled={!isEditing} value={formData.residence_zip || ''} onChange={e => handleInputChange('residence_zip', e.target.value)} />
                                    </div>
                                    <div className="col-span-2 space-y-2">
                                        <Label>Città</Label>
                                        <Input disabled={!isEditing} value={formData.residence_city || ''} onChange={e => handleInputChange('residence_city', e.target.value)} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Provincia</Label>
                                        <Input disabled={!isEditing} value={formData.residence_province || ''} onChange={e => handleInputChange('residence_province', e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Stato</Label>
                                        <Input disabled={!isEditing} value={formData.residence_country || ''} onChange={e => handleInputChange('residence_country', e.target.value)} />
                                    </div>
                                </div>
                            </div>
                        </section>

                        <Separator />

                        {/* Section: Documenti */}
                        <section className="space-y-4">
                            <h3 className="font-semibold flex items-center gap-2 text-primary">
                                <Shield className="h-4 w-4" /> Documento d'Identità
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Tipo</Label>
                                    <Input disabled={!isEditing} value={formData.document_type || ''} onChange={e => handleInputChange('document_type', e.target.value)} placeholder="carta_identita" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Numero</Label>
                                    <Input disabled={!isEditing} value={formData.document_number || ''} onChange={e => handleInputChange('document_number', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Rilasciato da</Label>
                                    <Input disabled={!isEditing} value={formData.document_issuer || ''} onChange={e => handleInputChange('document_issuer', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Data Rilascio</Label>
                                    <Input type="date" disabled={!isEditing} value={formData.document_issue_date ? format(new Date(formData.document_issue_date), 'yyyy-MM-dd') : ''} onChange={e => handleInputChange('document_issue_date', e.target.value)} />
                                </div>
                            </div>
                        </section>

                        <Separator />

                        <div className="space-y-2">
                            <Label>Note Interne</Label>
                            <Input disabled={!isEditing} value={formData.notes || ''} onChange={e => handleInputChange('notes', e.target.value)} placeholder="Note visibili solo allo staff..." />
                        </div>

                        {/* Save Button Sticky Bottom of Left Panel if editing */}
                        {isEditing && (
                            <div className="pt-4 sticky bottom-0 bg-background pb-4 border-t mt-4">
                                <Button className="w-full" onClick={handleSave} disabled={updateCustomerMutation.isPending}>
                                    {updateCustomerMutation.isPending ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2 h-4 w-4" />}
                                    Salva Modifiche
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Right Column: Bookings History - Full/Remaining Width */}
            <div className="flex-1 flex flex-col h-full bg-muted/20">
                <div className="p-6 pb-2">
                    <h2 className="text-xl font-bold flex items-center gap-2 mb-1">
                        <Calendar className="h-5 w-5" /> Storico Prenotazioni
                    </h2>
                    <p className="text-muted-foreground text-sm">
                        Visualizza e gestisci tutti i soggiorni di questo cliente.
                    </p>
                </div>

                <ScrollArea className="flex-1 px-6 pb-6">
                    <div className="space-y-4">
                        {bookings.length === 0 ? (
                            <div className="flex flex-col items-center justify-center p-12 text-muted-foreground border rounded-xl border-dashed bg-background/50">
                                <History className="h-10 w-10 mb-4 opacity-20" />
                                <p>Nessuna prenotazione trovata per questo cliente.</p>
                            </div>
                        ) : (
                            bookings.map((booking: Booking) => (
                                <Card key={booking.id} className="overflow-hidden hover:shadow-md transition-shadow">
                                    <div className="flex flex-col sm:flex-row border-l-4 border-l-primary/50">
                                        {/* Date Box */}
                                        <div className="bg-primary/5 p-4 flex flex-col items-center justify-center min-w-[120px] border-b sm:border-b-0 sm:border-r border-primary/10">
                                            <span className="text-xs font-semibold text-muted-foreground uppercase">Arrivo</span>
                                            <span className="text-xl font-bold text-primary">
                                                {booking.start ? format(booking.start, 'd MMM') : '?'}
                                            </span>
                                            <span className="text-xs text-muted-foreground mt-1">{booking.start ? format(booking.start, 'yyyy') : ''}</span>
                                        </div>

                                        {/* Content */}
                                        <div className="p-4 flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 items-center">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Badge variant="outline" className="font-mono">{booking.pitch?.number}</Badge>
                                                    <span className="text-xs uppercase font-medium text-muted-foreground">{booking.pitch?.type}</span>
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    Partenza: <span className="font-medium text-foreground">{booking.end ? format(booking.end, 'd MMM yyyy') : '?'}</span>
                                                </div>
                                            </div>

                                            <div className="flex flex-col sm:items-center">
                                                <div className="text-lg font-bold">€ {booking.total_price?.toFixed(2)}</div>
                                                <Badge variant={booking.status === 'checked_in' ? "secondary" : "outline"} className="w-fit">
                                                    {booking.status === 'checked_in' ? 'Checked-in' : booking.status}
                                                </Badge>
                                            </div>

                                            <div className="flex items-center gap-3 sm:justify-end bg-muted/30 p-2 rounded-lg">
                                                <Switch
                                                    id={`q-${booking.id}`}
                                                    checked={booking.questura_sent || false}
                                                    onCheckedChange={(checked) => updateBookingQuesturaMutation.mutate({
                                                        bookingId: booking.id,
                                                        sent: checked
                                                    })}
                                                />
                                                <div className="flex flex-col">
                                                    <Label htmlFor={`q-${booking.id}`} className="cursor-pointer font-medium text-sm">Questura</Label>
                                                    <span className={`text-[10px] uppercase font-bold ${booking.questura_sent ? 'text-green-600' : 'text-muted-foreground'}`}>
                                                        {booking.questura_sent ? 'Inviato' : 'Da inviare'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            ))
                        )}
                    </div>
                </ScrollArea>
            </div>
        </div>
    );
}
