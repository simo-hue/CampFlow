import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { CustomerGroup } from '@/lib/types';
import { toast } from 'sonner';

// Keys
export const GROUPS_QUERY_KEY = ['customer_groups'];

// Fetcher
const fetchGroups = async (): Promise<CustomerGroup[]> => {
    const response = await fetch('/api/groups');
    if (!response.ok) {
        throw new Error('Errore nel caricamento dei gruppi');
    }
    const data = await response.json();
    return data.groups || [];
};

export function useCustomerGroups() {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: GROUPS_QUERY_KEY,
        queryFn: fetchGroups,
        staleTime: Infinity, // Data changes rarely and only via this panel. Mutations will invalidate.
    });

    const createGroup = useMutation({
        mutationFn: async (data: Partial<CustomerGroup>) => {
            const response = await fetch('/api/groups', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Errore creazione gruppo');
            }
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: GROUPS_QUERY_KEY });
            toast.success('Gruppo creato con successo!');
        },
        onError: (error: Error) => {
            toast.error(`Errore: ${error.message}`);
        },
    });

    const updateGroup = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: Partial<CustomerGroup> }) => {
            const response = await fetch(`/api/groups/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Errore aggiornamento gruppo');
            }
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: GROUPS_QUERY_KEY });
            toast.success('Gruppo aggiornato con successo!');
        },
        onError: (error: Error) => {
            toast.error(`Errore: ${error.message}`);
        },
    });

    const deleteGroup = useMutation({
        mutationFn: async (id: string) => {
            const response = await fetch(`/api/groups/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Errore eliminazione gruppo');
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: GROUPS_QUERY_KEY });
            toast.success('Gruppo eliminato!');
        },
        onError: (error: Error) => {
            toast.error(`Errore: ${error.message}`);
        },
    });

    return {
        groups: query.data || [],
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error,
        createGroup,
        updateGroup,
        deleteGroup,
    };
}
