import { 
    Database, 
    Users, 
    CalendarDays, 
    MapPin, 
    History, 
    CheckCircle2, 
    AlertCircle 
} from 'lucide-react';

type StatsData = {
    sizeBytes: number | null;
    customers: number;
    bookings: number;
    logs: number;
    pitches: number;
    source: 'rpc' | 'fallback';
};

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

export default function SystemStatsWidget({ stats }: { stats: StatsData }) {
    return (
        <div className="mb-10">
            <div className="flex items-center justify-between mb-6 px-1">
                <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-500 flex items-center gap-3">
                    <Database className="h-4 w-4" />
                    Database telemetry
                </h2>
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest
                    ${stats.source === 'rpc' 
                        ? 'bg-green-500/10 border-green-500/20 text-green-400' 
                        : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'}`}>
                    {stats.source === 'rpc' ? <CheckCircle2 className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                    MODE: {stats.source.toUpperCase()}
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
