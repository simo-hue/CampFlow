import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Pitch, CreatePitchRequest, UpdatePitchRequest } from '@/lib/types';
import { toast } from 'sonner';

// Keys
export const PITCHES_QUERY_KEY = ['pitches'];

// Fetcher
const fetchPitches = async (): Promise<Pitch[]> => {
    const response = await fetch('/api/pitches');
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data.pitches || [];
};

// Hook
export function usePitches() {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: PITCHES_QUERY_KEY,
        queryFn: fetchPitches,
        staleTime: 1000 * 60 * 60 * 24, // 24 hours (effectively static)
    });

    // Mutations
    const createPitch = useMutation({
        mutationFn: async (data: CreatePitchRequest) => {
            const response = await fetch('/api/pitches', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Errore creazione piazzola');
            }
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: PITCHES_QUERY_KEY });
            toast.success('Piazzola creata!');
        },
        onError: (error: Error) => {
            toast.error(`Errore: ${error.message}`);
        },
    });

    const updatePitch = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: UpdatePitchRequest }) => {
            const response = await fetch(`/api/pitches?id=${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Errore aggiornamento piazzola');
            }
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: PITCHES_QUERY_KEY });
            toast.success('Piazzola aggiornata!');
        },
        onError: (error: Error) => {
            toast.error(`Errore: ${error.message}`);
        },
    });

    const deletePitch = useMutation({
        mutationFn: async (id: string) => {
            const response = await fetch(`/api/pitches?id=${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Errore eliminazione piazzola');
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: PITCHES_QUERY_KEY });
            toast.success('Piazzola eliminata!');
        },
        onError: (error: Error) => {
            toast.error(`Errore: ${error.message}`);
        },
    });

    const splitPitch = useMutation({
        mutationFn: async (id: string) => {
            const response = await fetch('/api/pitches/split', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pitch_id: id }),
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Errore sdoppiamento piazzola');
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: PITCHES_QUERY_KEY });
            toast.success('Piazzola sdoppiata!');
        },
        onError: (error: Error) => {
            toast.error(`Errore: ${error.message}`);
        },
    });

    const mergePitches = useMutation({
        mutationFn: async ({ pitchAId, pitchBId }: { pitchAId: string; pitchBId: string }) => {
            const response = await fetch('/api/pitches/merge', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    pitch_a_id: pitchAId,
                    pitch_b_id: pitchBId,
                }),
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Errore unione piazzole');
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: PITCHES_QUERY_KEY });
            toast.success('Piazzole unite!');
        },
        onError: (error: Error) => {
            toast.error(`Errore: ${error.message}`);
        },
    });

    return {
        pitches: query.data || [],
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error,
        createPitch,
        updatePitch,
        deletePitch,
        splitPitch,
        mergePitches,
    };
}
