"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { OccupancyChart } from "@/components/stats/OccupancyChart";
import { addDays, startOfDay, subDays, format } from "date-fns";
import { Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useEffect, useMemo } from "react";

interface OccupancyData {
    date: string;
    piazzola: number;
    tenda: number;
    total: number;
}

const CACHE_KEY_PREFIX = "campflow-weekly-occupancy-v2";

async function fetchWeeklyOccupancyFromAPI(startDate: string, endDate: string): Promise<OccupancyData[]> {
    const response = await fetch(`/api/stats/weekly-occupancy?start=${startDate}&end=${endDate}`);
    if (!response.ok) {
        throw new Error('Failed to fetch weekly occupancy data');
    }
    return response.json();
}

export function WeeklyOccupancyWidget() {
    const queryClient = useQueryClient();

    // Calculate range: Today - 3 days to Today + 3 days
    const today = startOfDay(new Date());
    const start = subDays(today, 3);
    const end = addDays(today, 3);

    // Format dates for API
    const startStr = format(start, 'yyyy-MM-dd');
    const endStr = format(end, 'yyyy-MM-dd');

    // Memoize queryKey to prevent infinite useEffect loop
    const queryKey = useMemo(() =>
        ["stats", "weekly-forecast", startStr, endStr],
        [startStr, endStr]
    );

    const storageKey = `${CACHE_KEY_PREFIX}-${startStr}`;

    // Load from localStorage AFTER mount to avoid hydration mismatch
    useEffect(() => {
        try {
            const cached = window.localStorage.getItem(storageKey);
            if (cached) {
                const data = JSON.parse(cached);
                // Initialize query data if not already present
                queryClient.setQueryData(queryKey, (old: OccupancyData[] | undefined) => {
                    return old || data;
                });
            }
        } catch (e) {
            console.warn("Failed to load occupancy cache", e);
        }
    }, [queryClient, storageKey, queryKey]);

    const { data: occupancyData, isLoading, error } = useQuery({
        queryKey: queryKey,
        queryFn: () => fetchWeeklyOccupancyFromAPI(startStr, endStr),
        staleTime: 1000 * 60 * 5, // Cache in memory for 5 minutes
    });

    // Save to localStorage when we get fresh data
    useEffect(() => {
        if (occupancyData) {
            try {
                window.localStorage.setItem(storageKey, JSON.stringify(occupancyData));
            } catch (e) {
                console.warn("Failed to save occupancy cache", e);
            }
        }
    }, [occupancyData, storageKey]);

    // Render loading state initially (matching server)
    if (isLoading && !occupancyData) {
        return (
            <Card className="h-[400px] flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </Card>
        );
    }

    if (error) {
        return (
            <Card className="h-[400px] flex items-center justify-center text-red-500">
                Errore nel caricamento del grafico.
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            <OccupancyChart data={occupancyData || []} title="Panoramica Settimanale" />
        </div>
    );
}

