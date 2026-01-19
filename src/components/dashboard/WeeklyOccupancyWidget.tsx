"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchStats } from "@/lib/api/stats";
import { OccupancyLineChart } from "@/components/stats/OccupancyLineChart";
import { addDays, startOfDay, endOfDay, subDays } from "date-fns";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function WeeklyOccupancyWidget() {
    // Calculate range: Today - 3 days to Today + 3 days
    const today = startOfDay(new Date());
    const start = subDays(today, 3);
    const end = endOfDay(addDays(today, 3));

    const { data: stats, isLoading, error } = useQuery({
        queryKey: ["stats", "weekly-forecast"],
        queryFn: () => fetchStats(start, end),
    });

    if (isLoading) {
        return (
            <Card className="h-[400px] flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </Card>
        );
    }

    if (error || !stats) {
        return (
            <Card className="h-[400px] flex items-center justify-center text-red-500">
                Errore nel caricamento del grafico.
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            {/* We reuse the OccupancyChart but we might want to override the title inside it or wrap it 
          Currently OccupancyChart has its own Card wraper with a specific title.
          Ideally we should refactor OccupancyChart to be just the chart, or accept a title.
          For now, let's see how it looks. It has "Occupazione Giornaliera" title which is fine.
          But we want to emphasize "Previsione 7 Giorni".
      */}

            {/* 
          Since OccupancyChart exports a full Card, I will use it directly.
          If I need to change the title, I should refactor OccupancyChart to accept props or be more composable.
          For this iteration, I'll stick to using it as is, as "Occupazione Giornaliera" is technically correct.
          Wait, the user sees "Occupazione Giornaliera" on the stats page too. 
          Maybe I should refactor OccupancyChart to accept a title prop?
          
          Let's do a quick check on OccupancyChart source again.
          It has <CardTitle>Occupazione Giornaliera</CardTitle> hardcoded.
          
          I will refactor OccupancyChart first to accept an optional title.
      */}
            <OccupancyLineChart data={stats.charts.occupancyByDate} title="Panoramica Settimanale" />
        </div>
    );
}
