import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import type { Pitch } from '@/lib/types';

interface AvailabilityResponse {
    pitches: Pitch[];
    total_available: number;
}

const fetchAvailability = async (checkIn: Date, checkOut: Date): Promise<AvailabilityResponse> => {
    const params = new URLSearchParams({
        check_in: format(checkIn, 'yyyy-MM-dd'),
        check_out: format(checkOut, 'yyyy-MM-dd'),
    });

    const response = await fetch(`/api/availability?${params}`);

    if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Errore nella ricerca');
    }

    return response.json();
};

export function useAvailability(checkIn: Date | undefined, checkOut: Date | undefined) {
    return useQuery({
        queryKey: ['availability', checkIn?.toISOString(), checkOut?.toISOString()],
        queryFn: () => fetchAvailability(checkIn!, checkOut!),
        enabled: !!checkIn && !!checkOut,
        staleTime: 1000 * 60 * 5, // 5 minutes cache
        placeholderData: (previousData) => previousData, // Keep previous data while fetching new
    });
}
