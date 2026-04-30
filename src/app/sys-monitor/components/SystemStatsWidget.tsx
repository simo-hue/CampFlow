'use client';
import { logger } from '@/lib/logger';

import { useEffect, useState } from 'react';
import { 
    Database, 
    Users, 
    CalendarDays, 
    MapPin, 
    History, 
    CheckCircle2, 
    AlertCircle,
    RefreshCw,
    Clock
} from 'lucide-react';
import { fetchStatsAction } from '../login/actions';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

type StatsData = {
    sizeBytes: number | null;
    customers: number;
    bookings: number;
    logs: number;
    pitches: number;
    source: 'rpc' | 'fallback';
    timestamp?: string;
};

const CACHE_KEY = 'campflow_sys_stats_cache';

function StatCard({ 
    label, 
    value, 
    subtext, 
    icon: Icon, 
    color = 'blue' 
}: { 
    label: string, 
    value: string | number, 
    subtext?: string, 
    icon: any,
    color?: 'blue' | 'green' | 'purple' | 'yellow' | 'red' 
}) {
    const colors = {
        blue: 'text-blue-400 bg-blue-500/5 border-blue-500/10 hover:border-blue-500/30',
        green: 'text-green-400 bg-green-500/5 border-green-500/10 hover:border-green-500/30',
        purple: 'text-purple-400 bg-purple-500/5 border-purple-500/10 hover:border-purple-500/30',
        yellow: 'text-yellow-400 bg-yellow-500/5 border-yellow-500/10 hover:border-yellow-500/30',
        red: 'text-red-400 bg-red-500/5 border-red-500/10 hover:border-red-500/30',
    };

    return (
        <div className={`border rounded-2xl p-5 transition-all group ${colors[color]}`}>
            <div className="flex justify-between items-start mb-4">
                <span className="text-[10px] uppercase font-black tracking-widest opacity-60">{label}</span>
                <Icon className="h-4 w-4 opacity-40 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="text-3xl font-black font-mono tracking-tighter mb-1">{value}</div>
            {subtext && <div className="text-[10px] font-bold uppercase tracking-widest opacity-40">{subtext}</div>}
        </div>
    );
}

function formatBytes(bytes: number) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export default function SystemStatsWidget({ initialStats }: { initialStats?: StatsData }) {
    const [stats, setStats] = useState<StatsData | null>(initialStats || null);
    const [loading, setLoading] = useState(!initialStats);
    const [isStale, setIsStale] = useState(false);

    const refreshData = async () => {
        setLoading(true);
        try {
            const result = await fetchStatsAction();
            if (result.success && result.data) {
                const newData = result.data as StatsData;
                setStats(newData);
                setIsStale(false);
                localStorage.setItem(CACHE_KEY, JSON.stringify(newData));
            } else {
                throw new Error('Fetch failed');
            }
        } catch (err) {
            logger.error('Failed to refresh telemetry:', { error: err });
            setIsStale(true);
            // Try to load from localStorage if state is empty
            if (!stats) {
                const cached = localStorage.getItem(CACHE_KEY);
                if (cached) setStats(JSON.parse(cached));
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // 1. Check if we have cached data in localStorage on mount
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached && !initialStats) {
            setStats(JSON.parse(cached));
            setIsStale(true); // Mark as stale until refreshed
        }
        
        // 2. Initial Refresh
        refreshData();
    }, []);

    if (!stats) {
        return (
            <div className="mb-10 p-12 bg-gray-900/20 border border-gray-800 rounded-2xl flex flex-col items-center justify-center gap-4 text-gray-500">
                <RefreshCw className="h-8 w-8 animate-spin opacity-20" />
                <p className="text-xs font-bold uppercase tracking-widest">Initializing Telemetry Engine...</p>
            </div>
        );
    }

    return (
        <div className="mb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 px-1 gap-4">
                <div className="flex items-center gap-3">
                    <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 flex items-center gap-3">
                        <Database className="h-4 w-4" />
                        Database telemetry
                    </h2>
                    {loading && <RefreshCw className="h-3 w-3 animate-spin text-blue-500" />}
                </div>

                <div className="flex items-center gap-3">
                    {stats.timestamp && (
                        <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/5 text-[9px] font-bold text-gray-500">
                            <Clock className="h-3 w-3" />
                            UPDATED: {format(new Date(stats.timestamp), 'HH:mm:ss', { locale: it })}
                            {isStale && <span className="text-orange-500 ml-1">(CACHED)</span>}
                        </div>
                    )}
                    
                    <button 
                        onClick={refreshData}
                        disabled={loading}
                        className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-gray-500 hover:text-white disabled:opacity-50"
                    >
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>

                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest
                        ${stats.source === 'rpc' 
                            ? 'bg-green-500/10 border-green-500/20 text-green-400' 
                            : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'}`}>
                        {stats.source === 'rpc' ? <CheckCircle2 className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                        MODE: {stats.source.toUpperCase()}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <StatCard
                    label="Physical Storage"
                    value={stats.sizeBytes !== null ? formatBytes(stats.sizeBytes) : 'OFFLINE'}
                    subtext={stats.sizeBytes === null ? 'RPC Required' : 'Storage consumed'}
                    icon={Database}
                    color={stats.sizeBytes !== null ? "purple" : "red"}
                />
                <StatCard
                    label="Customer Base"
                    value={stats.customers}
                    subtext="Total profiles"
                    icon={Users}
                    color="blue"
                />
                <StatCard
                    label="Global Bookings"
                    value={stats.bookings}
                    subtext="Lifetime records"
                    icon={CalendarDays}
                    color="green"
                />
                <StatCard
                    label="Active Pitches"
                    value={stats.pitches}
                    subtext="Unit configuration"
                    icon={MapPin}
                    color="blue"
                />
                <StatCard
                    label="Log Retention"
                    value={stats.logs}
                    subtext="Telemetry depth"
                    icon={History}
                    color={stats.logs > 5000 ? 'yellow' : 'blue'}
                />
            </div>

            {stats.source === 'fallback' && (
                <div className="mt-6 p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-xl flex items-start gap-4">
                    <AlertCircle className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                        <p className="text-[11px] font-bold text-yellow-500 uppercase tracking-widest">Enhanced Telemetry Unavailable</p>
                        <p className="text-[11px] text-yellow-500/60 leading-relaxed">
                            Physical storage statistics are currently estimated. To enable precise hardware monitoring, 
                            please deploy the <code className="bg-yellow-500/10 px-1.5 py-0.5 rounded text-yellow-500">get_db_stats</code> RPC module in your Supabase environment.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
