import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { PricingSeason } from '@/lib/types';
import { toast } from 'sonner';

// Keys
export const SEASONS_QUERY_KEY = ['seasons'];

// Fetcher
const fetchSeasons = async (): Promise<PricingSeason[]> => {
    const response = await fetch('/api/pricing/seasons');
    if (!response.ok) {
        throw new Error('Errore caricamento stagioni');
    }
    const data = await response.json();
    // Assuming the API returns { seasons: PricingSeason[] }
    return data.seasons || [];
};

export function useSeasons() {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: SEASONS_QUERY_KEY,
        queryFn: fetchSeasons,
        staleTime: 1000 * 60 * 60 * 24, // 24 hours (effectively static)
    });

    const saveSeason = useMutation({
        mutationFn: async ({ id, data }: { id?: string; data: Partial<PricingSeason> }) => {
            let response;
            if (id) {
                // Update
                response = await fetch(`/api/pricing/seasons?id=${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data),
                });
            } else {
                // Create
                response = await fetch('/api/pricing/seasons', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data),
                });
            }

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Errore salvataggio stagione');
            }
            return response.json();
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: SEASONS_QUERY_KEY });
            toast.success(variables.id ? 'Stagione aggiornata!' : 'Stagione creata!');
        },
        onError: (error: Error) => {
            toast.error(`Errore: ${error.message}`);
        },
    });

    const deleteSeason = useMutation({
        mutationFn: async (id: string) => {
            const response = await fetch(`/api/pricing/seasons?id=${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Errore eliminazione stagione');
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: SEASONS_QUERY_KEY });
            toast.success('Stagione eliminata!');
        },
        onError: (error: Error) => {
            toast.error(`Errore: ${error.message}`);
        },
    });

    return {
        seasons: query.data || [],
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error,
        saveSeason,
        deleteSeason,
    };
}
