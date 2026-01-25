'use client';

import * as React from 'react';
import { Check, ChevronsUpDown, User, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';

import type { Customer } from '@/lib/types';
import { toast } from 'sonner';

interface CustomerAutocompleteProps {
    onSelect: (customer: Customer) => void;
    onClear: () => void;
    selectedCustomerId?: string;
}

export function CustomerAutocomplete({ onSelect, onClear, selectedCustomerId }: CustomerAutocompleteProps) {
    const [open, setOpen] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState('');
    const [customers, setCustomers] = React.useState<Customer[]>([]);
    const [loading, setLoading] = React.useState(false);

    // Simple debounce logic if hook doesn't exist
    const [debouncedQuery, setDebouncedQuery] = React.useState('');

    React.useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(searchQuery);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    React.useEffect(() => {
        if (!debouncedQuery || debouncedQuery.length < 2) {
            setCustomers([]);
            return;
        }

        const fetchCustomers = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/customers?q=${encodeURIComponent(debouncedQuery)}`);
                if (!res.ok) throw new Error('Failed to search customers');
                const data = await res.json();
                setCustomers(data.customers || []);
            } catch (error) {
                console.error('Search error:', error);
                toast.error("Errore ricerca clienti");
            } finally {
                setLoading(false);
            }
        };

        fetchCustomers();
    }, [debouncedQuery]);

    // Derived selected label
    const selectedCustomer = React.useMemo(() => {
        // If we have local search results, try to find it there first
        // In a real app with large data, we might need a separate fetch for the selected ID if it's not in the current search results
        // For now, we assume this component controls the selection primarily.
        /* 
           NOTE: If selectedCustomerId is passed from parent but not in `customers` list (e.g. initial load),
           we might show "Cliente Selezionato" or similar. 
           However, in this specific flow, selection happens HERE, so we usually have the object.
           But the parent manages state. We might need the parent to pass the full object if available.
        */
        return customers.find(c => c.id === selectedCustomerId);
    }, [customers, selectedCustomerId]);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                >
                    {selectedCustomerId
                        ? (selectedCustomer
                            ? `${selectedCustomer.first_name} ${selectedCustomer.last_name}`
                            : "Cliente Selezionato")
                        : "Cerca cliente esistente..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-0" align="start">
                <Command shouldFilter={false}>
                    {/* shouldFilter={false} because we filter via API */}
                    <CommandInput
                        placeholder="Cerca per nome, telefono o email..."
                        value={searchQuery}
                        onValueChange={setSearchQuery}
                    />
                    <CommandList>
                        {loading && <div className="p-4 text-sm text-center text-muted-foreground"><Search className="w-4 h-4 animate-pulse inline mr-2" />Cercando...</div>}
                        {!loading && debouncedQuery.length >= 2 && customers.length === 0 && (
                            <CommandEmpty>Nessun cliente trovato.</CommandEmpty>
                        )}
                        {!loading && debouncedQuery.length < 2 && (
                            <div className="py-6 text-center text-sm text-muted-foreground">
                                Inizia a scrivere per cercare...
                            </div>
                        )}
                        <CommandGroup>
                            {customers.map((customer) => (
                                <CommandItem
                                    key={customer.id}
                                    value={customer.id + " " + customer.first_name + " " + customer.last_name} // Value for internal keying
                                    onSelect={() => {
                                        onSelect(customer);
                                        setOpen(false);
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            selectedCustomerId === customer.id ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    <div className="flex flex-col">
                                        <span className='font-medium'>{customer.first_name} {customer.last_name}</span>
                                        <span className="text-xs text-muted-foreground">
                                            {customer.phone} • {customer.email}
                                            {customer.license_plate && ` • ${customer.license_plate}`}
                                        </span>
                                    </div>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
