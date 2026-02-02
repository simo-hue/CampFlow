'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Card,
    CardContent,
} from '@/components/ui/card';
import { Search, UserPlus, Users, Loader2, Mail, Phone, ChevronRight, ChevronDown, Pencil, Trash2, Tag } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { useDebounce } from '@/hooks/use-debounce';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { CustomerDialog } from '@/components/dashboard/CustomerDialog';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useCustomerGroups } from '@/hooks/useCustomerGroups';

import { useRouter } from 'next/navigation';

import type { Customer as BaseCustomer } from '@/lib/types';
// Extend customer type to include joined data
type Customer = BaseCustomer & {
    customer_groups?: {
        name: string;
        color: string;
    } | null;
};

export default function CustomersPage() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const debouncedQuery = useDebounce(searchQuery, 300);
    const [groupFilter, setGroupFilter] = useState('all');
    const queryClient = useQueryClient();
    const { groups } = useCustomerGroups();

    // Delete Confirmation State
    const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);

    const confirmDelete = async () => {
        if (!customerToDelete) return;

        try {
            const res = await fetch(`/api/customers/${customerToDelete.id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Errore eliminazione');
            toast.success('Cliente eliminato con successo');
            queryClient.invalidateQueries({ queryKey: ['customers'] });
        } catch (e: any) {
            toast.error(e.message);
        } finally {
            setCustomerToDelete(null);
        }
    };

    const handleDeleteClick = (customer: Customer) => {
        setCustomerToDelete(customer);
    };

    const { data, isLoading, error } = useQuery({
        queryKey: ['customers', debouncedQuery, groupFilter],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (debouncedQuery) params.append('q', debouncedQuery);
            if (groupFilter !== 'all') params.append('group_id', groupFilter);

            const response = await fetch(`/api/customers?${params.toString()}`);
            if (!response.ok) {
                throw new Error('Failed to fetch customers');
            }
            return response.json();
        },
    });

    return (
        <div className="h-[calc(100vh-4rem)] flex flex-col bg-muted/5 p-0 overflow-hidden">

            {/* Header: Centered & Professional */}
            <div className="flex flex-col items-center justify-center text-center gap-4 shrink-0 py-6 px-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight flex items-center justify-center gap-2">
                        <Users className="h-8 w-8 text-primary" />
                        Clienti
                    </h1>
                    <p className="text-muted-foreground text-sm max-w-[500px]">
                        Gestisci l'anagrafica completa degli ospiti, visualizza lo storico delle prenotazioni e accedi rapidamente ai dettagli.
                    </p>
                </div>

                {/* Main Action Bar: Search & Filters & Add */}
                <div className="flex flex-col md:flex-row w-full max-w-4xl items-stretch md:items-center gap-3">

                    {/* Search & Filter Container (Check-in style) */}
                    <div className="flex flex-col md:flex-row flex-1 items-stretch md:items-center gap-0 bg-background/60 backdrop-blur-md p-1.5 rounded-xl border shadow-sm w-full">
                        <div className="relative flex-1 group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <Input
                                placeholder="Cerca per nome, email o telefono..."
                                className="pl-10 h-10 text-sm bg-transparent border-transparent focus-visible:ring-0 placeholder:text-muted-foreground/70"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <div className="h-6 w-[1px] bg-border hidden md:block mx-1" />

                        <div className="relative md:w-[220px]">
                            <select
                                className="appearance-none flex h-10 w-full rounded-lg bg-muted/50 hover:bg-muted/80 transition-colors px-3 py-2 pr-8 text-sm font-medium focus:outline-none cursor-pointer border-0"
                                value={groupFilter}
                                onChange={(e) => setGroupFilter(e.target.value)}
                            >
                                <option value="all">Tutti i gruppi</option>
                                <option value="none">Nessun gruppo</option>
                                {groups.map(group => (
                                    <option key={group.id} value={group.id}>
                                        {group.name}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                        </div>
                    </div>

                    {/* New Button */}
                    <Button
                        className="shadow-sm h-[54px] md:h-auto rounded-xl px-6 bg-primary text-primary-foreground hover:bg-primary/90"
                        onClick={() => router.push('/customers/new')}
                    >
                        <UserPlus className="mr-2 h-4 w-4" />
                        Nuovo
                    </Button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 w-full overflow-hidden">
                <div className="h-full flex flex-col pt-0">
                    <div className="flex-1 flex flex-col overflow-hidden">

                        {/* Table Header Row (Sticky) */}
                        <div className="border-b bg-muted/30 px-6 py-3 grid grid-cols-12 gap-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            <div className="col-span-4">Cliente</div>
                            <div className="col-span-4">Contatti</div>
                            <div className="col-span-2">Registrato</div>
                            <div className="col-span-2 text-right">Azioni</div>
                        </div>

                        {/* Scrollable List */}
                        <ScrollArea className="flex-1">
                            {isLoading ? (
                                <div className="flex flex-col items-center justify-center h-48 gap-3 text-muted-foreground">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                    <p className="text-sm">Caricamento clienti...</p>
                                </div>
                            ) : error ? (
                                <div className="flex flex-col items-center justify-center h-48 gap-3 text-red-500">
                                    <p>Errore nel caricamento dei dati.</p>
                                </div>
                            ) : data?.customers?.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-64 gap-3 text-muted-foreground">
                                    <Users className="h-12 w-12 opacity-20" />
                                    <p>Nessun cliente trovato con questi criteri.</p>
                                </div>
                            ) : (
                                <div className="divide-y">
                                    {data?.customers?.map((customer: Customer) => (
                                        <div
                                            key={customer.id}
                                            className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-muted/30 transition-colors group cursor-pointer"
                                            onClick={() => router.push(`/customers/${customer.id}`)}
                                        >
                                            {/* Name & Avatar */}
                                            <div className="col-span-4 flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                                                    {customer.first_name[0]}{customer.last_name[0]}
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-foreground group-hover:text-primary transition-colors">
                                                        {customer.first_name} {customer.last_name}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground hidden lg:block">ID: {customer.id.slice(0, 8)}...</div>
                                                    {customer.customer_groups && (
                                                        <Badge variant="outline" className="mt-1 text-[10px] px-1 py-0" style={{ borderColor: customer.customer_groups.color, color: customer.customer_groups.color }}>
                                                            {customer.customer_groups.name}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Contacts */}
                                            <div className="col-span-4 space-y-1">
                                                <div className="flex items-center gap-2 text-sm text-foreground/80">
                                                    <Mail className="h-3 w-3 text-muted-foreground" />
                                                    {customer.email || <span className="text-muted-foreground italic">Nessuna email</span>}
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-foreground/80">
                                                    <Phone className="h-3 w-3 text-muted-foreground" />
                                                    {customer.phone || <span className="text-muted-foreground italic">Nessun telefono</span>}
                                                </div>
                                            </div>

                                            {/* Registered */}
                                            <div className="col-span-2">
                                                <Badge variant="secondary" className="font-normal text-xs text-muted-foreground bg-muted/50">
                                                    {customer.created_at ? format(new Date(customer.created_at), 'd MMM yyy', { locale: it }) : '-'}
                                                </Badge>
                                            </div>

                                            {/* Actions */}
                                            <div className="col-span-2 flex justify-end">
                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:text-destructive" onClick={(e) => { e.stopPropagation(); handleDeleteClick(customer); }}>
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </ScrollArea>
                    </div>
                </div>
            </div>


            <AlertDialog open={!!customerToDelete} onOpenChange={(open) => !open && setCustomerToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Sei assolutamente sicuro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Questa azione non può essere annullata. Stai per eliminare definitivamente il cliente
                            <span className="font-semibold text-foreground"> {customerToDelete?.first_name} {customerToDelete?.last_name}</span>.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Annulla</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Elimina Cliente
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
