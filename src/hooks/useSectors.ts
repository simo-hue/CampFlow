import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export interface Sector {
    id: string;
    name: string;
    created_at?: string;
}

export const SECTORS_QUERY_KEY = ['sectors'];

export function useSectors() {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: SECTORS_QUERY_KEY,
        queryFn: async (): Promise<Sector[]> => {
            const response = await fetch('/api/sectors');
            if (!response.ok) throw new Error('Failed to fetch sectors');
            const data = await response.json();
            return data.sectors || [];
        },
    });

    const createSector = useMutation({
        mutationFn: async (data: { name: string }) => {
            const response = await fetch('/api/sectors', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to create sector');
            }
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: SECTORS_QUERY_KEY });
            toast.success('Settore creato');
        },
        onError: (error: Error) => toast.error(error.message),
    });

    const updateSector = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: { name: string } }) => {
            const response = await fetch(`/api/sectors?id=${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to update sector');
            }
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: SECTORS_QUERY_KEY });
            toast.success('Settore aggiornato');
        },
        onError: (error: Error) => toast.error(error.message),
    });

    const deleteSector = useMutation({
        mutationFn: async (id: string) => {
            const response = await fetch(`/api/sectors?id=${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to delete sector');
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: SECTORS_QUERY_KEY });
            toast.success('Settore eliminato');
        },
        onError: (error: Error) => toast.error(error.message),
    });

    return {
        sectors: query.data || [],
        isLoading: query.isLoading,
        createSector,
        updateSector,
        deleteSector,
    };
}
