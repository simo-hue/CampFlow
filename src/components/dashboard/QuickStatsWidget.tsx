'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import type { DashboardStats } from '@/lib/types';

export function QuickStatsWidget() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchStats() {
            try {
                const response = await fetch('/api/stats');
                if (!response.ok) throw new Error('Failed to fetch stats');
                const data = await response.json();
                setStats(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Unknown error');
            } finally {
                setLoading(false);
            }
        }

        fetchStats();

        // Refresh every 30 seconds
        const interval = setInterval(fetchStats, 30000);
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div className="grid gap-4 md:grid-cols-3">
                {[1, 2, 3].map(i => (
                    <Card key={i} className="animate-pulse">
                        <CardHeader className="pb-2">
                            <div className="h-4 bg-gray-200 rounded w-24" />
                        </CardHeader>
                        <CardContent>
                            <div className="h-8 bg-gray-200 rounded w-16" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    if (error || !stats) {
        return (
            <Card className="border-destructive">
                <CardContent className="pt-6">
                    <p className="text-destructive">Errore nel caricamento delle statistiche</p>
                </CardContent>
            </Card>
        );
    }

    const getOccupancyColor = (percentage: number) => {
        if (percentage >= 90) return 'bg-red-500';
        if (percentage >= 70) return 'bg-orange-500';
        if (percentage >= 50) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    const getOccupancyBadgeVariant = (percentage: number): "default" | "destructive" | "secondary" => {
        if (percentage >= 90) return 'destructive';
        if (percentage >= 70) return 'secondary';
        return 'default';
    };

    return (
        <div className="grid gap-4 md:grid-cols-3">
            {/* Arrivals Today */}
            <Link href="/arrivals" className="block transition-transform hover:scale-[1.02]">
                <Card className="border-l-4 border-l-green-500 cursor-pointer h-full hover:bg-accent/5">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            📥 Arrivi Oggi
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{stats.arrivals_today}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Check-in previsti
                        </p>
                    </CardContent>
                </Card>
            </Link>

            {/* Departures Today */}
            <Link href="/departures" className="block transition-transform hover:scale-[1.02]">
                <Card className="border-l-4 border-l-blue-500 cursor-pointer h-full hover:bg-accent/5">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            📤 Partenze Oggi
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{stats.departures_today}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Check-out previsti
                        </p>
                    </CardContent>
                </Card>
            </Link>

            {/* Current Occupancy */}
            <Card className="border-l-4 border-l-purple-500">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                        <span>📊 Occupazione Attuale</span>
                        <Badge variant={getOccupancyBadgeVariant(stats.occupancy_percentage)}>
                            {stats.occupancy_percentage}%
                        </Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold mb-2">
                        {stats.current_occupancy} <span className="text-lg text-muted-foreground">/ {stats.total_pitches}</span>
                    </div>
                    <Progress
                        value={stats.occupancy_percentage}
                        className="h-2"
                        indicatorClassName={getOccupancyColor(stats.occupancy_percentage)}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
