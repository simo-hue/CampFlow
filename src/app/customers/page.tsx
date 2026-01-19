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
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Search, UserPlus, Users, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { useDebounce } from '@/hooks/use-debounce'; // Assuming this exists, otherwise I'll implement local debounce or just onChange for now

type Customer = {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    created_at: string;
    // Add other fields as needed based on DB schema
};

export default function CustomersPage() {
    const [searchQuery, setSearchQuery] = useState('');

    // Quick debounce implementation if hook doesn't exist
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
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Clienti</h1>
                    <p className="text-muted-foreground">
                        Gestisci l'anagrafica clienti e visualizza lo storico prenotazioni.
                    </p>
                </div>
                <Button>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Nuovo Cliente
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Lista Clienti</CardTitle>
                    <CardDescription>
                        Cerca per nome, email o numero di telefono.
                    </CardDescription>
                    <div className="pt-4">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Cerca clienti..."
                                className="pl-8 max-w-sm"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center p-8">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : error ? (
                        <div className="text-center text-red-500 p-4">
                            Errore nel caricamento dei clienti.
                        </div>
                    ) : (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nome</TableHead>
                                        <TableHead>Contatti</TableHead>
                                        <TableHead>Registrato il</TableHead>
                                        <TableHead className="text-right">Azioni</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data?.customers?.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                                                Nessun cliente trovato.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        data?.customers?.map((customer: Customer) => (
                                            <TableRow key={customer.id}>
                                                <TableCell className="font-medium">
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                                            {customer.first_name[0]}{customer.last_name[0]}
                                                        </div>
                                                        <div>
                                                            {customer.first_name} {customer.last_name}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm">
                                                        <div className="flex items-center gap-1">
                                                            <span className="text-muted-foreground w-4">📧</span>
                                                            {customer.email || '-'}
                                                        </div>
                                                        <div className="flex items-center gap-1 mt-1">
                                                            <span className="text-muted-foreground w-4">📞</span>
                                                            {customer.phone || '-'}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {customer.created_at ? format(new Date(customer.created_at), 'dd MMM yyyy', { locale: it }) : '-'}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Link href={`/customers/${customer.id}`}>
                                                        <Button variant="ghost" size="sm">
                                                            Dettagli
                                                        </Button>
                                                    </Link>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
