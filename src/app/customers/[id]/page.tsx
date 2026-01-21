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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
    History,
    BarChart3
} from 'lucide-react';
import Link from 'next/link';
import { format, differenceInCalendarDays } from 'date-fns';
import { it } from 'date-fns/locale';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils';

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
    birth_place?: string;
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
    guests?: any[];
};

const parseBookingPeriod = (period: string) => {
    if (!period) return { start: null, end: null };
    try {
        const clean = period.replace(/[\[\]\(\)]/g, '');
        const [startStr, endStr] = clean.split(',');
        const start = new Date(startStr);
        const end = new Date(endStr);

        // Validate dates
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return { start: null, end: null };
        }

        return { start, end };
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
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000,   // 10 minutes
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

    if (!data) return null;

    const { customer, bookings } = data;
    const totalBookings = bookings.length;
    const totalSpent = bookings.reduce((acc: number, b: Booking) => acc + (b.total_price || 0), 0);

    // Calculate Statistics
    const totalPresenceDays = bookings.reduce((acc: number, b: Booking) => {
        if (b.start && b.end) {
            const days = differenceInCalendarDays(b.end, b.start);
            return acc + (days > 0 ? days : 0);
        }
        return acc;
    }, 0);

    const averageStay = totalBookings > 0 ? (totalPresenceDays / totalBookings).toFixed(1) : 0;

    const handleSave = () => {
        updateCustomerMutation.mutate(formData);
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const StatCard = ({ label, value, icon: Icon, subtext }: { label: string, value: string | number, icon: any, subtext?: string }) => (
        <Card>
            <CardContent className="p-6 flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Icon className="h-6 w-6" />
                </div>
                <div>
                    <p className="text-sm font-medium text-muted-foreground">{label}</p>
                    <p className="text-2xl font-bold">{value}</p>
                    {subtext && <p className="text-xs text-muted-foreground mt-1">{subtext}</p>}
                </div>
            </CardContent>
        </Card>
    );

    return (
        <div className="flex flex-col bg-muted/10 p-4 md:p-8 gap-6 min-h-screen">

            {/* Header: Identity & Navigation - Centered */}
            <div className="flex flex-col items-center justify-center text-center gap-2 shrink-0">
                <div className="space-y-1">
                    <Link href="/customers" className='text-sm text-muted-foreground hover:text-foreground flex items-center justify-center gap-1 mb-2'>
                        <ArrowLeft className="h-3 w-3" /> Torna alla lista
                    </Link>
                    <h1 className="text-3xl font-bold tracking-tight">{customer.first_name} {customer.last_name}</h1>
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                        <Badge variant="secondary" className="font-normal">
                            Cliente dal {format(new Date(customer.created_at), 'MMM yyyy', { locale: it })}
                        </Badge>
                        <span className="text-muted-foreground">•</span>
                        <span>{customer.email}</span>
                        <span className="text-muted-foreground">•</span>
                        <span>{customer.phone}</span>
                    </div>
                </div>
            </div>

            {/* Main Content Tabs - Full Height & Width */}
            <Tabs defaultValue="anagrafica" className="flex-1 flex flex-col w-full">

                {/* Custom Pill-shaped Tab List - Centered */}
                <div className="flex justify-center shrink-0 mb-6">
                    <TabsList className="bg-muted/50 p-1 h-11 rounded-full border">
                        <TabsTrigger value="anagrafica" className="rounded-full px-6 data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all">
                            Anagrafica
                        </TabsTrigger>
                        <TabsTrigger value="prenotazioni" className="rounded-full px-6 data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all">
                            Prenotazioni
                        </TabsTrigger>
                        <TabsTrigger value="stats" className="rounded-full px-6 data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all">
                            Statistiche
                        </TabsTrigger>
                    </TabsList>
                </div>

                {/* TAB 1: ANAGRAFICA (Form & Editing) */}
                <TabsContent value="anagrafica" className="flex-1 w-full mt-0">
                    <Card className="flex flex-col border shadow-sm bg-card">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                            <div>
                                <CardTitle>Dati Personali</CardTitle>
                                <CardDescription>Gestisci le informazioni anagrafiche, la residenza e i documenti.</CardDescription>
                            </div>
                            <Button
                                variant={isEditing ? "destructive" : "outline"}
                                size="sm"
                                onClick={() => setIsEditing(!isEditing)}
                            >
                                {isEditing ? <X className="h-4 w-4 mr-2" /> : <Pencil className="h-4 w-4 mr-2" />}
                                {isEditing ? 'Annulla Modifiche' : 'Modifica Dati'}
                            </Button>
                        </CardHeader>
                        <Separator />

                        <CardContent className="p-8 space-y-8 max-w-5xl mx-auto w-full">
                            {/* Section: Contatti & Info Base */}
                            <section className="space-y-4">
                                <h3 className="font-semibold flex items-center gap-2 text-primary text-sm uppercase tracking-wide">
                                    <User className="h-4 w-4" /> Anagrafica e Contatti
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label>Nome</Label>
                                        <Input className="bg-background" disabled={!isEditing} value={formData.first_name || ''} onChange={e => handleInputChange('first_name', e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Cognome</Label>
                                        <Input className="bg-background" disabled={!isEditing} value={formData.last_name || ''} onChange={e => handleInputChange('last_name', e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Email</Label>
                                        <Input className="bg-background" disabled={!isEditing} value={formData.email || ''} onChange={e => handleInputChange('email', e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Telefono</Label>
                                        <Input className="bg-background" disabled={!isEditing} value={formData.phone || ''} onChange={e => handleInputChange('phone', e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Data di Nascita</Label>
                                        <Input className="bg-background" type="date" disabled={!isEditing} value={formData.birth_date ? format(new Date(formData.birth_date), 'yyyy-MM-dd') : ''} onChange={e => handleInputChange('birth_date', e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Sesso</Label>
                                        <Input className="bg-background" disabled={!isEditing} value={formData.gender || ''} onChange={e => handleInputChange('gender', e.target.value)} placeholder="M/F" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6 pt-2">
                                    <div className="space-y-2">
                                        <Label>Comune Nascita</Label>
                                        <Input className="bg-background" disabled={!isEditing} value={formData.birth_city || ''} onChange={e => handleInputChange('birth_city', e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Provincia</Label>
                                        <Input className="bg-background" disabled={!isEditing} value={formData.birth_province || ''} onChange={e => handleInputChange('birth_province', e.target.value)} />
                                    </div>
                                </div>
                            </section>

                            <Separator />

                            {/* Section: Residenza */}
                            <section className="space-y-4">
                                <h3 className="font-semibold flex items-center gap-2 text-primary text-sm uppercase tracking-wide">
                                    <MapPin className="h-4 w-4" /> Residenza
                                </h3>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Indirizzo</Label>
                                        <Input className="bg-background" disabled={!isEditing} value={formData.address || ''} onChange={e => handleInputChange('address', e.target.value)} placeholder="Via Roma, 1" />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="md:col-span-1 space-y-2">
                                            <Label>CAP</Label>
                                            <Input className="bg-background" disabled={!isEditing} value={formData.residence_zip || ''} onChange={e => handleInputChange('residence_zip', e.target.value)} />
                                        </div>
                                        <div className="md:col-span-2 space-y-2">
                                            <Label>Città</Label>
                                            <Input className="bg-background" disabled={!isEditing} value={formData.residence_city || ''} onChange={e => handleInputChange('residence_city', e.target.value)} />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label>Provincia</Label>
                                            <Input className="bg-background" disabled={!isEditing} value={formData.residence_province || ''} onChange={e => handleInputChange('residence_province', e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Stato</Label>
                                            <Input className="bg-background" disabled={!isEditing} value={formData.residence_country || ''} onChange={e => handleInputChange('residence_country', e.target.value)} />
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <Separator />

                            {/* Section: Documenti */}
                            <section className="space-y-4">
                                <h3 className="font-semibold flex items-center gap-2 text-primary text-sm uppercase tracking-wide">
                                    <Shield className="h-4 w-4" /> Documento d'Identità
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label>Tipo</Label>
                                        <Input className="bg-background" disabled={!isEditing} value={formData.document_type || ''} onChange={e => handleInputChange('document_type', e.target.value)} placeholder="carta_identita" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Numero</Label>
                                        <Input className="bg-background" disabled={!isEditing} value={formData.document_number || ''} onChange={e => handleInputChange('document_number', e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Rilasciato da</Label>
                                        <Input className="bg-background" disabled={!isEditing} value={formData.document_issuer || ''} onChange={e => handleInputChange('document_issuer', e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Data Rilascio</Label>
                                        <Input className="bg-background" type="date" disabled={!isEditing} value={formData.document_issue_date ? format(new Date(formData.document_issue_date), 'yyyy-MM-dd') : ''} onChange={e => handleInputChange('document_issue_date', e.target.value)} />
                                    </div>
                                </div>
                            </section>

                            <Separator />

                            {/* Notes */}
                            <div className="space-y-2">
                                <Label>Note Interne</Label>
                                <Input className="bg-background" disabled={!isEditing} value={formData.notes || ''} onChange={e => handleInputChange('notes', e.target.value)} placeholder="Note visibili solo allo staff..." />
                            </div>
                        </CardContent>
                        {isEditing && (
                            <CardFooter className="bg-muted/10 border-t flex justify-center py-4 shrink-0">
                                <Button className="w-full md:w-auto min-w-[200px]" onClick={handleSave} disabled={updateCustomerMutation.isPending}>
                                    {updateCustomerMutation.isPending ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2 h-4 w-4" />}
                                    Salva Modifiche
                                </Button>
                            </CardFooter>
                        )}
                    </Card>
                </TabsContent>

                {/* TAB 2: PRENOTAZIONI (List) */}
                <TabsContent value="prenotazioni" className="flex-1 w-full mt-0">
                    <div className="space-y-4 max-w-5xl mx-auto w-full pb-8">
                        {bookings.length === 0 ? (
                            <Card className="p-12 text-center text-muted-foreground border-dashed bg-card">
                                <History className="h-10 w-10 mx-auto mb-4 opacity-20" />
                                <p>Nessuna prenotazione trovata.</p>
                            </Card>
                        ) : (
                            bookings.map((booking: Booking) => (
                                <Card key={booking.id} className="overflow-hidden border shadow-sm bg-card hover:bg-card/80 transition-colors">
                                    <div className="flex flex-col md:flex-row">
                                        {/* Date Box */}
                                        <div className="bg-muted/30 p-4 md:w-48 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r">
                                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Check-in</span>
                                            <span className="text-2xl font-bold text-foreground">
                                                {booking.start ? format(booking.start, 'd MMM') : '?'}
                                            </span>
                                            <span className="text-sm text-muted-foreground">{booking.start ? format(booking.start, 'yyyy') : ''}</span>
                                        </div>

                                        {/* Content */}
                                        <div className="p-5 flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                                            <div>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Badge variant="outline" className="font-mono">{booking.pitch?.number}</Badge>
                                                    <span className="text-xs uppercase font-medium text-muted-foreground">{booking.pitch?.type}</span>
                                                </div>
                                                <div className="text-sm">
                                                    Check-out: <span className="font-medium">{booking.end ? format(booking.end, 'd MMM yyyy') : '?'}</span>
                                                </div>
                                            </div>

                                            <div className="flex flex-col md:items-center">
                                                <div className="text-xl font-bold">{formatCurrency(booking.total_price || 0)}</div>
                                                <Badge variant={booking.status === 'checked_in' ? "secondary" : "outline"} className="w-fit mt-1">
                                                    {booking.status === 'checked_in' ? 'Checked-in' : booking.status}
                                                </Badge>
                                            </div>

                                            <div className="md:justify-self-end">
                                                <div className="flex items-center gap-3 bg-muted/20 p-2 rounded-lg border">
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
                                                            {booking.questura_sent ? 'Inviato' : 'Da Inviare'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            ))
                        )}
                    </div>
                </TabsContent>

                {/* TAB 3: STATISTICHE (Stats Only) */}
                <TabsContent value="stats" className="flex-1 w-full mt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto w-full">
                        <StatCard
                            label="Prenotazioni Totali"
                            value={totalBookings}
                            icon={History}
                            subtext="Soggiorni completati o futuri"
                        />
                        <StatCard
                            label="Spesa Totale"
                            value={formatCurrency(totalSpent)}
                            icon={CreditCard}
                            subtext="Fatturato netto generato"
                        />
                        {/* Placeholder for future stats */}
                        <StatCard
                            label="Giorni di Presenza"
                            value={totalPresenceDays}
                            icon={Calendar}
                            subtext="Totale notti trascorse"
                        />
                        <StatCard
                            label="Media Soggiorno"
                            value={`${averageStay} notti`}
                            icon={BarChart3}
                            subtext="Durata media prenotazione"
                        />
                    </div>
                </TabsContent>
            </Tabs>
        </div >
    );
}
