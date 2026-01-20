"use client";

import { useState } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { fetchStats } from "@/lib/api/stats";
import { KPICard } from "@/components/stats/KPICard";
import { RevenueChart } from "@/components/stats/RevenueChart";
import { OccupancyChart } from "@/components/stats/OccupancyChart";
import {
    Euro,
    Users,
    CalendarDays,
    Clock,
    Loader2
} from "lucide-react";
import {
    Tabs,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import { subDays, startOfYear, endOfDay } from "date-fns";

type TimeRange = "7d" | "30d" | "90d" | "year";

export default function StatsPage() {
    const [range, setRange] = useState<TimeRange>("30d");

    const getDateRange = (r: TimeRange) => {
        const end = endOfDay(new Date());
        let start = subDays(end, 30);

        switch (r) {
            case "7d":
                start = subDays(end, 7);
                break;
            case "30d":
                start = subDays(end, 30);
                break;
            case "90d":
                start = subDays(end, 90);
                break;
            case "year":
                start = startOfYear(end);
                break;
        }
        return { start, end };
    };

    const { start, end } = getDateRange(range);

    const {
        data: stats,
        isLoading,
        isFetching
    } = useQuery({
        queryKey: ["stats", range],
        queryFn: () => fetchStats(start, end),
        placeholderData: keepPreviousData,
    });

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Dashboard Statistiche</h2>
                <div className="flex items-center space-x-2">
                    <Tabs value={range} onValueChange={(v) => setRange(v as TimeRange)} className="space-y-4">
                        <TabsList>
                            <TabsTrigger value="7d">7 Giorni</TabsTrigger>
                            <TabsTrigger value="30d">30 Giorni</TabsTrigger>
                            <TabsTrigger value="90d">3 Mesi</TabsTrigger>
                            <TabsTrigger value="year">Quest'anno</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>
            </div>

            <div className="space-y-4 relative">
                {/* Global Loading Overlay for Refresh */}
                {isFetching && !isLoading && (
                    <div className="absolute inset-0 bg-background/50 z-20 flex items-start justify-center pt-32 rounded-lg">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                )}

                {isLoading ? (
                    <div className="flex h-[400px] items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : stats ? (
                    <div className={`space-y-4 transition-opacity duration-300 ${isFetching ? 'opacity-50' : 'opacity-100'}`}>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <KPICard
                                title="Ricavi Totali"
                                value={`€${stats.kpi.revenue.toLocaleString()}`}
                                icon={Euro}
                                description="Nel periodo selezionato"
                            />
                            <KPICard
                                title="Occupazione"
                                value={`${stats.kpi.occupancyRate}%`}
                                icon={CalendarDays}
                                description="Tasso occupazione medio"
                            />
                            <KPICard
                                title="Prenotazioni"
                                value={stats.kpi.totalBookings}
                                icon={Users}
                                description="Totale prenotazioni"
                            />
                            <KPICard
                                title="Soggiorno Medio"
                                value={`${stats.kpi.averageStay} notti`}
                                icon={Clock}
                                description="Durata media"
                            />
                        </div>

                        <div className="grid gap-4 md:grid-cols-1">
                            <RevenueChart data={stats.charts.revenueByDate} />
                        </div>

                        <div className="grid gap-4 md:grid-cols-1">
                            <OccupancyChart data={stats.charts.occupancyByDate} />
                        </div>
                    </div>
                ) : null}
            </div>
        </div>
    );
}
