'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import { Search } from 'lucide-react';
import type { Customer } from '@/lib/types';
import { toast } from "sonner";

export function GlobalSearchBar() {
    const [open, setOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [customers, setCustomers] = useState<Customer[]>([]);

    // Keyboard shortcut handler
    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };

        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, []);

    // Search customers by phone or name
    const searchCustomers = useCallback(async (query: string) => {
        if (!query || query.length < 2) {
            setCustomers([]);
            return;
        }

        try {
            const response = await fetch(`/api/customers?search=${encodeURIComponent(query)}`);
            if (response.ok) {
                const data = await response.json();
                setCustomers(data.customers || []);
            }
        } catch (error) {
            console.error('Search error:', error);

            toast.error("Errore imprevisto", { description: error instanceof Error ? error.message : "Riprova più tardi" });
        }
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            searchCustomers(searchTerm);
        }, 300);

        return () => clearTimeout(timer);
    }, [searchTerm, searchCustomers]);

    return (
        <>
            {/* Trigger Button */}
            <button
                onClick={() => setOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground bg-background border rounded-md hover:bg-accent hover:text-accent-foreground w-full md:w-64"
            >
                <Search className="h-4 w-4" />
                <span>Cerca</span>
                <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                    <span className="text-xs">⌘</span>K
                </kbd>
            </button>

            {/* Command Dialog */}
            <CommandDialog open={open} onOpenChange={setOpen}>
                <CommandInput
                    placeholder="Cerca per nome, telefono, o ID prenotazione..."
                    value={searchTerm}
                    onValueChange={setSearchTerm}
                />
                <CommandList>
                    <CommandEmpty>Nessun risultato trovato.</CommandEmpty>

                    {customers.length > 0 && (
                        <CommandGroup heading="Clienti">
                            {customers.map((customer) => (
                                <CommandItem
                                    key={customer.id}
                                    onSelect={() => {
                                        console.log('Selected customer:', customer.id);
                                        setOpen(false);
                                        // TODO: Navigate to customer detail or open modal
                                    }}
                                >
                                    <div className="flex flex-col">
                                        <span className="font-medium">{`${customer.first_name} ${customer.last_name}`}</span>
                                        <span className="text-sm text-muted-foreground">
                                            {customer.phone}
                                            {customer.email && ` • ${customer.email}`}
                                            {customer.license_plate && ` • ${customer.license_plate}`}
                                        </span>
                                    </div>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    )}

                    {/* Bookings search will be implemented in Phase 2 */}
                </CommandList>
            </CommandDialog>
        </>
    );
}
