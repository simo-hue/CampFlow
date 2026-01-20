"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
    const [globalRange, setGlobalRange] = useState<TimeRange>("30d");
    const [revenueRange, setRevenueRange] = useState<TimeRange>("30d");
    const [occupancyRange, setOccupancyRange] = useState<TimeRange>("30d");

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

    // 1. Global KPIs Query
    const { start: globalStart, end: globalEnd } = getDateRange(globalRange);
    const { data: globalStats, isLoading: globalLoading } = useQuery({
        queryKey: ["stats", "global", globalRange],
        queryFn: () => fetchStats(globalStart, globalEnd),
    });

    // 2. Revenue Chart Query
    const { start: revenueStart, end: revenueEnd } = getDateRange(revenueRange);
    const { data: revenueStats, isLoading: revenueLoading } = useQuery({
        queryKey: ["stats", "revenue", revenueRange],
        queryFn: () => fetchStats(revenueStart, revenueEnd),
    });

    // 3. Occupancy Chart Query
    const { start: occupancyStart, end: occupancyEnd } = getDateRange(occupancyRange);
    const { data: occupancyStats, isLoading: occupancyLoading } = useQuery({
        queryKey: ["stats", "occupancy", occupancyRange],
        queryFn: () => fetchStats(occupancyStart, occupancyEnd),
    });

    // Helper for Chart Actions
    const renderTimeRangeSelector = (value: TimeRange, onChange: (v: TimeRange) => void) => (
        <Tabs value={value} onValueChange={(v) => onChange(v as TimeRange)}>
            <TabsList className="h-8">
                <TabsTrigger value="7d" className="text-xs h-6 px-2">7gg</TabsTrigger>
                <TabsTrigger value="30d" className="text-xs h-6 px-2">30gg</TabsTrigger>
                <TabsTrigger value="90d" className="text-xs h-6 px-2">3m</TabsTrigger>
                <TabsTrigger value="year" className="text-xs h-6 px-2">Anno</TabsTrigger>
            </TabsList>
        </Tabs>
    );

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Dashboard Statistiche</h2>
                <div className="flex items-center space-x-2">
                    <Tabs value={globalRange} onValueChange={(v) => setGlobalRange(v as TimeRange)} className="space-y-4">
                        <TabsList>
                            <TabsTrigger value="7d">7 Giorni</TabsTrigger>
                            <TabsTrigger value="30d">30 Giorni</TabsTrigger>
                            <TabsTrigger value="90d">3 Mesi</TabsTrigger>
                            <TabsTrigger value="year">Quest'anno</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>
            </div>

            <div className="space-y-4">
                {/* KPIs Section */}
                {globalLoading ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 h-32">
                        <div className="col-span-4 flex items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    </div>
                ) : globalStats ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <KPICard
                            title="Ricavi Totali"
                            value={`€${globalStats.kpi.revenue.toLocaleString()}`}
                            icon={Euro}
                            description="Nel periodo selezionato"
                        />
                        <KPICard
                            title="Occupazione"
                            value={`${globalStats.kpi.occupancyRate}%`}
                            icon={CalendarDays}
                            description="Tasso occupazione medio"
                        />
                        <KPICard
                            title="Prenotazioni"
                            value={globalStats.kpi.totalBookings}
                            icon={Users}
                            description="Totale prenotazioni"
                        />
                        <KPICard
                            title="Soggiorno Medio"
                            value={`${globalStats.kpi.averageStay} notti`}
                            icon={Clock}
                            description="Durata media"
                        />
                    </div>
                ) : null}

                {/* Revenue Chart */}
                <div className="grid gap-4 md:grid-cols-1">
                    {revenueLoading ? (
                        <div className="h-[300px] flex items-center justify-center border rounded-lg">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : revenueStats ? (
                        <RevenueChart
                            data={revenueStats.charts.revenueByDate}
                            action={renderTimeRangeSelector(revenueRange, setRevenueRange)}
                        />
                    ) : null}
                </div>

                {/* Occupancy Chart */}
                <div className="grid gap-4 md:grid-cols-1">
                    {occupancyLoading ? (
                        <div className="h-[300px] flex items-center justify-center border rounded-lg">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : occupancyStats ? (
                        <OccupancyChart
                            data={occupancyStats.charts.occupancyByDate}
                            action={renderTimeRangeSelector(occupancyRange, setOccupancyRange)}
                        />
                    ) : null}
                </div>
            </div>
        </div>
    );
}
