"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchWeeklyOccupancy } from "@/lib/api/stats";
import { OccupancyChart } from "@/components/stats/OccupancyChart";
import { addDays, startOfDay, endOfDay, subDays } from "date-fns";
import { Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useEffect, useMemo } from "react";

const CACHE_KEY_PREFIX = "campflow-weekly-occupancy-v1";

export function WeeklyOccupancyWidget() {
    const queryClient = useQueryClient();

    // Calculate range: Today - 3 days to Today + 3 days
    const today = startOfDay(new Date());
    const start = subDays(today, 3);
    const end = endOfDay(addDays(today, 3));

    // Stable strings for dependencies
    const startIso = start.toISOString();
    const endIso = end.toISOString();

    // Memoize queryKey to prevent infinite useEffect loop
    const queryKey = useMemo(() =>
        ["stats", "weekly-forecast", startIso, endIso],
        [startIso, endIso]
    );

    const storageKey = `${CACHE_KEY_PREFIX}-${startIso}`;

    // Load from localStorage AFTER mount to avoid hydration mismatch
    useEffect(() => {
        try {
            const cached = window.localStorage.getItem(storageKey);
            if (cached) {
                const data = JSON.parse(cached);
                // Initialize query data if not already present
                queryClient.setQueryData(queryKey, (old: any) => {
                    return old || data;
                });
            }
        } catch (e) {
            console.warn("Failed to load occupancy cache", e);
        }
    }, [queryClient, storageKey, queryKey]);

    const { data: occupancyData, isLoading, error } = useQuery({
        queryKey: queryKey,
        queryFn: () => fetchWeeklyOccupancy(start, end),
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
