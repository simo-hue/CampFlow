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
    Card,
    CardContent,
} from '@/components/ui/card';
import { Search, UserPlus, Users, Loader2, Mail, Phone, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { useDebounce } from '@/hooks/use-debounce';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

type Customer = {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    created_at: string;
};

export default function CustomersPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const debouncedQuery = useDebounce(searchQuery, 300);

    const { data, isLoading, error } = useQuery({
        queryKey: ['customers', debouncedQuery],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (debouncedQuery) params.append('q', debouncedQuery);

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

                {/* Main Action Bar: Search & Add */}
                <div className="flex w-full max-w-2xl items-center gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Cerca per nome, email o telefono..."
                            className="pl-9 bg-background/50 backdrop-blur-sm border-muted-foreground/20"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Button className="shadow-sm">
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
                                        <div key={customer.id} className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-muted/30 transition-colors group">
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
                                                <Link href={`/customers/${customer.id}`}>
                                                    <Button variant="secondary" size="sm" className="gap-1 shadow-sm hover:bg-primary hover:text-primary-foreground transition-all">
                                                        Dettagli <ChevronRight className="h-3 w-3" />
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </ScrollArea>
                    </div>
                </div>
            </div>
        </div >
    );
}
