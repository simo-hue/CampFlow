import { format } from 'date-fns';

type StatsData = {
    sizeBytes: number | null;
    customers: number;
    bookings: number;
    logs: number;
    pitches: number;
    source: 'rpc' | 'fallback';
};

function StatCard({ label, value, subtext, color = 'blue' }: { label: string, value: string | number, subtext?: string, color?: 'blue' | 'green' | 'purple' | 'yellow' | 'red' }) {
    const colors = {
        blue: 'text-blue-400 border-blue-500/20 bg-blue-500/5',
        green: 'text-green-400 border-green-500/20 bg-green-500/5',
        purple: 'text-purple-400 border-purple-500/20 bg-purple-500/5',
        yellow: 'text-yellow-400 border-yellow-500/20 bg-yellow-500/5',
        red: 'text-red-400 border-red-500/20 bg-red-500/5',
    };

    return (
        <div className={`border rounded-lg p-4 flex flex-col justify-between ${colors[color]}`}>
            <span className="text-xs uppercase font-semibold opacity-70 mb-1">{label}</span>
            <div className="text-2xl font-bold font-mono">{value}</div>
            {subtext && <div className="text-[10px] opacity-60 mt-1">{subtext}</div>}
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
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 mb-8">
            <h2 className="text-gray-400 font-semibold mb-4 uppercase text-xs tracking-wider flex items-center justify-between">
                <span>Database Statistics</span>
                <span className={`text-[10px] px-2 py-0.5 rounded ${stats.source === 'rpc' ? 'bg-green-900/30 text-green-400' : 'bg-yellow-900/30 text-yellow-400'}`}>
                    Source: {stats.source.toUpperCase()}
                </span>
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <StatCard
                    label="Total Size"
                    value={stats.sizeBytes !== null ? formatBytes(stats.sizeBytes) : 'N/A'}
                    subtext={stats.sizeBytes === null ? 'Run RPC SQL' : 'Physical Size'}
                    color={stats.sizeBytes !== null ? "purple" : "yellow"}
                />
                <StatCard
                    label="Customers"
                    value={stats.customers}
                    subtext="Registered users"
                    color="blue"
                />
                <StatCard
                    label="Bookings"
                    value={stats.bookings}
                    subtext="Total reservations"
                    color="green"
                />
                <StatCard
                    label="Pitches"
                    value={stats.pitches}
                    subtext="Configured units"
                    color="blue"
                />
                <StatCard
                    label="System Logs"
                    value={stats.logs}
                    subtext="Retained entries"
                    color={stats.logs > 1000 ? 'yellow' : 'blue'}
                />
            </div>

            {stats.source === 'fallback' && (
                <div className="mt-4 p-3 bg-yellow-900/10 border border-yellow-500/20 rounded text-[10px] text-yellow-500/80">
                    <strong>Note:</strong> Detailed statistics (like DB Size) are missing because the <code>get_db_stats</code> RPC function is not installed.
                    Please run `supabase/rpc_get_db_stats.sql` in your Supabase SQL Editor.
                </div>
            )}
        </div>
    );
}
