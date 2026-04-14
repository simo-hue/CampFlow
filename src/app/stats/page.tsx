"use client";

import { useState, useEffect } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { KPICard } from "@/components/stats/KPICard";
import { RevenueChart } from "@/components/stats/RevenueChart";
import { OccupancyChart } from "@/components/stats/OccupancyChart";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Euro,
    Users,
    CalendarDays,
    Clock,
    Loader2,
    Lock
} from "lucide-react";
import {
    Tabs,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import { subDays, startOfYear, endOfDay, endOfYear } from "date-fns";
import { formatCurrency } from "@/lib/utils";

type TimeRange = "7d" | "30d" | "90d" | "year";

export default function StatsPage() {
    const [range, setRange] = useState<TimeRange>("30d");
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [passwordInput, setPasswordInput] = useState("");
    const [error, setError] = useState(false);

    useEffect(() => {
        const unlocked = localStorage.getItem("statsUnlocked");
        if (unlocked === "true") {
            setIsUnlocked(true);
        }
    }, []);

    const handleUnlock = (e: React.FormEvent) => {
        e.preventDefault();
        const correctPassword = process.env.NEXT_PUBLIC_STATS_PSW;
        
        if (!correctPassword) {
            console.error("NEXT_PUBLIC_STATS_PSW is not defined in environment variables.");
            setError(true);
            return;
        }

        if (passwordInput.trim() === correctPassword.trim()) {
            setIsUnlocked(true);
            localStorage.setItem("statsUnlocked", "true");
            setError(false);
        } else {
            setError(true);
            // Vibrate if supported
            if (typeof navigator !== "undefined" && navigator.vibrate) {
                navigator.vibrate(200);
            }
            setTimeout(() => setError(false), 2000);
        }
    };

    const getDateRange = (r: TimeRange) => {
        let end = endOfDay(new Date());
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
                const now = new Date();
                start = startOfYear(now);
                end = endOfYear(now);
                break;
        }
        return { start, end };
    };

    const { start, end } = getDateRange(range);

    async function fetchStatsFromAPI() {
        const startStr = start.toISOString();
        const endStr = end.toISOString();
        const res = await fetch(`/api/stats/analytics?start=${startStr}&end=${endStr}`);
        if (!res.ok) throw new Error("Failed to fetch stats");
        return res.json();
    }

    const {
        data: stats,
        isLoading,
        isFetching
    } = useQuery({
        queryKey: ["stats", range],
        queryFn: fetchStatsFromAPI,
        placeholderData: keepPreviousData,
    });

    return (
        <div className="relative flex-1 p-8 pt-6 min-h-[calc(100vh-4rem)]">
            {!isUnlocked && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-sm transition-all duration-300">
                    <div className="bg-card p-8 rounded-xl shadow-lg border w-full max-w-[400px] flex flex-col items-center">
                        <div className="bg-primary/10 p-4 rounded-full mb-4">
                            <Lock className="w-8 h-8 text-primary" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Area Protetta</h2>
                        <p className="text-muted-foreground text-center mb-6">
                            Inserisci la password per visualizzare le statistiche.
                        </p>
                        <form onSubmit={handleUnlock} className="w-full flex flex-col space-y-4">
                            <div className="flex space-x-2">
                                <Input
                                    type="password"
                                    placeholder="Password"
                                    value={passwordInput}
                                    onChange={(e) => setPasswordInput(e.target.value)}
                                    className={error ? "border-red-500 focus-visible:ring-red-500" : ""}
                                    autoFocus
                                />
                                <Button type="submit">Sblocca</Button>
                            </div>
                            {error && (
                                <p className="text-red-500 text-sm text-center animate-in fade-in slide-in-from-top-1">
                                    Password errata. Riprova.
                                </p>
                            )}
                        </form>
                    </div>
                </div>
            )}

            <div className={`space-y-4 transition-all duration-500 ${!isUnlocked ? "opacity-40 pointer-events-none select-none blur-[8px] max-h-[80vh] overflow-hidden" : ""}`}>
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
                                value={formatCurrency(stats.kpi.revenue)}
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
        </div>
    );
}
