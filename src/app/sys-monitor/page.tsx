import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase/server';
import { format } from 'date-fns';
import { logoutAction } from './login/actions';
import { getAuthStatus } from './login/actions';
import DatabaseManagerWidget from './components/DatabaseManagerWidget';
import SystemStatsWidget from './components/SystemStatsWidget';
import { Terminal, Activity, ShieldCheck, LogOut, Trash2, Eraser } from 'lucide-react';

type LogEntry = {
    id: string;
    timestamp: string;
    level: string;
    message: string;
    meta: any;
};

// -- Components --
function StatusBadge({ status }: { status: 'healthy' | 'error' | 'warning' }) {
    const colors = {
        healthy: 'bg-green-500/10 text-green-400 border-green-500/20',
        error: 'bg-red-500/10 text-red-400 border-red-500/20',
        warning: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    };

    return (
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${colors[status]}`}>
            {status.toUpperCase()}
        </span>
    );
}

// -- Data Fetching --
async function getLogs() {
    const supabase = supabaseAdmin;
    const { data } = await supabase
        .from('app_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(50);
    return data || [];
}

async function checkDbConnection() {
    const start = performance.now();
    try {
        const supabase = supabaseAdmin;
        const { error } = await supabase.from('app_logs').select('id').limit(1);
        const end = performance.now();
        if (error) throw error;
        return {
            status: 'healthy' as const,
            latency: Math.round(end - start),
            message: 'Connected'
        };
    } catch (err: any) {
        return {
            status: 'error' as const,
            latency: 0,
            message: 'Failed'
        };
    }
}

async function getStats() {
    const supabase = supabaseAdmin;
    let totalSize: number | null = null;
    let counts = {
        customers: 0,
        bookings: 0,
        logs: 0,
        pitches: 0
    };
    let source: 'rpc' | 'fallback' = 'fallback';

    try {
        // 1. Try to get accurate storage stats if function exists
        const { data: storageData } = await supabase.rpc('get_storage_stats');
        if (storageData && Array.isArray(storageData)) {
            totalSize = storageData.reduce((acc, curr) => acc + (Number(curr.total_size_bytes) || 0), 0);
        }

        // 2. Try to get counts via RPC if function exists
        const { data: dbStats, error: rpcError } = await supabase.rpc('get_db_stats');
        if (!rpcError && dbStats) {
            // Some RPCs return an array, some a single object depending on definition
            const stats = Array.isArray(dbStats) ? dbStats[0] : dbStats;
            if (stats) {
                counts.bookings = Number(stats.total_bookings || stats.bookings) || 0;
                counts.customers = Number(stats.total_customers || stats.customers) || 0;
                counts.pitches = Number(stats.total_pitches || stats.pitches) || 0;
                source = 'rpc';
            }
        }
    } catch (e) {
        console.warn('RPC Stats fetch failed, falling back to manual counts');
    }

    // 3. Fallback or complement data
    try {
        if (source === 'fallback') {
            const [
                { count: customers },
                { count: bookings },
                { count: logs },
                { count: pitches }
            ] = await Promise.all([
                supabase.from('customers').select('*', { count: 'exact', head: true }),
                supabase.from('bookings').select('*', { count: 'exact', head: true }),
                supabase.from('app_logs').select('*', { count: 'exact', head: true }),
                supabase.from('pitches').select('*', { count: 'exact', head: true })
            ]);
            counts.customers = customers || 0;
            counts.bookings = bookings || 0;
            counts.logs = logs || 0;
            counts.pitches = pitches || 0;
        } else {
            // Always get logs count manually as it's often missing from summary RPCs
            const { count: logsCount } = await supabase.from('app_logs').select('*', { count: 'exact', head: true });
            counts.logs = logsCount || 0;
        }
    } catch (e) {
        console.error('Manual stats fallback failed:', e);
    }

    return {
        sizeBytes: totalSize,
        ...counts,
        source
    };
}

export default async function SysMonitorPage() {
    const isAuthed = await getAuthStatus();
    if (!isAuthed) redirect('/sys-monitor/login');

    const dbHealth = await checkDbConnection();
    const stats = await getStats();
    const logs = await getLogs();

    return (
        <div className="min-h-screen bg-[#050505] text-gray-300 font-sans selection:bg-blue-500/30 selection:text-blue-200">
            {/* Ambient Background Glows */}
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/5 rounded-full blur-[120px]"></div>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto p-4 md:p-8">
                
                {/* Header */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/20">
                            <Terminal className="text-white h-6 w-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                                CAMPFLOW <span className="text-blue-500">CORE</span>
                            </h1>
                            <div className="flex items-center gap-3 mt-1">
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded">v1.4.2_LTS</span>
                                <span className="w-1 h-1 bg-gray-700 rounded-full"></span>
                                <span className="text-[10px] font-bold text-blue-500/80 uppercase tracking-widest">System Monitor</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 bg-gray-900/50 border border-gray-800/50 p-1.5 rounded-xl backdrop-blur-md">
                        <div className="px-3 py-1.5 flex items-center gap-2 border-r border-gray-800">
                            <div className={`w-1.5 h-1.5 rounded-full ${dbHealth.status === 'healthy' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">DB: {dbHealth.latency}ms</span>
                        </div>
                        <form action={logoutAction}>
                            <button className="flex items-center gap-2 px-3 py-1.5 text-gray-400 hover:text-white transition-all text-[10px] font-bold uppercase tracking-widest group">
                                <LogOut className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
                                Terminate Session
                            </button>
                        </form>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
                    {/* Status Card */}
                    <div className="lg:col-span-1 bg-gray-900/40 border border-gray-800 rounded-2xl p-5 backdrop-blur-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <Activity className="h-4 w-4 text-green-400" />
                            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400">Environment Status</h2>
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center pb-3 border-b border-white/5">
                                <span className="text-xs text-gray-500">DB Connectivity</span>
                                <StatusBadge status={dbHealth.status} />
                            </div>
                            <div className="flex justify-between items-center pb-3 border-b border-white/5">
                                <span className="text-xs text-gray-500">Runtime Env</span>
                                <span className="text-[10px] font-mono text-blue-400 bg-blue-500/5 px-2 py-0.5 rounded border border-blue-500/10 uppercase">{process.env.NODE_ENV}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-500">Cloud Region</span>
                                <span className="text-[10px] font-mono text-gray-400 uppercase">{process.env.VERCEL_REGION || 'Local_Host'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Config Card */}
                    <div className="lg:col-span-2 bg-gray-900/40 border border-gray-800 rounded-2xl p-5 backdrop-blur-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <ShieldCheck className="h-4 w-4 text-blue-400" />
                            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400">Infrastructure Validation</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                            {[
                                { key: 'SUPABASE_URL', status: !!process.env.NEXT_PUBLIC_SUPABASE_URL },
                                { key: 'SERVICE_ROLE', status: !!process.env.SUPABASE_SERVICE_ROLE_KEY },
                                { key: 'ADMIN_AUTH', status: !!process.env.ADMIN_USERNAME },
                                { key: 'LOGGER_ENG', status: true }
                            ].map((env) => (
                                <div key={env.key} className="flex justify-between items-center py-2 px-3 bg-black/20 rounded-lg border border-white/5">
                                    <span className="text-[10px] font-mono text-gray-500">{env.key}</span>
                                    <div className="flex items-center gap-2">
                                        <div className={`w-1 h-1 rounded-full ${env.status ? 'bg-blue-500' : 'bg-red-500'}`}></div>
                                        <span className={`text-[9px] font-bold ${env.status ? 'text-blue-500' : 'text-red-500'}`}>
                                            {env.status ? 'VERIFIED' : 'MISSING'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* System Stats Section */}
                <SystemStatsWidget stats={stats} />

                {/* Core Engine Section */}
                <div className="mb-10">
                    <DatabaseManagerWidget />
                </div>

                {/* Logs Terminal Section */}
                <div className="bg-gray-900/40 border border-gray-800 rounded-2xl overflow-hidden backdrop-blur-sm shadow-2xl">
                    <div className="p-5 border-b border-gray-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h2 className="text-xs font-bold uppercase tracking-widest text-white flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
                                App Engine Logs
                            </h2>
                            <p className="text-[10px] text-gray-500 mt-1">Real-time application activity monitoring</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <form action={async () => {
                                'use server';
                                const { cleanLogsAction } = await import('./login/actions');
                                await cleanLogsAction();
                            }}>
                                <button className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white text-[10px] font-bold uppercase tracking-widest rounded-lg border border-gray-700 transition-all">
                                    <Trash2 className="h-3 w-3" />
                                    Purge Old
                                </button>
                            </form>
                            <form action={async () => {
                                'use server';
                                const { clearAllLogsAction } = await import('./login/actions');
                                await clearAllLogsAction();
                            }}>
                                <button className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 text-[10px] font-bold uppercase tracking-widest rounded-lg border border-red-500/20 transition-all">
                                    <Eraser className="h-3 w-3" />
                                    Nuke All
                                </button>
                            </form>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-black/40 text-gray-500 text-[10px] uppercase tracking-widest">
                                    <th className="p-4 font-bold border-b border-gray-800">Timestamp</th>
                                    <th className="p-4 font-bold border-b border-gray-800">Level</th>
                                    <th className="p-4 font-bold border-b border-gray-800">Operation</th>
                                    <th className="p-4 font-bold border-b border-gray-800">Payload</th>
                                </tr>
                            </thead>
                            <tbody className="text-[11px] font-mono">
                                {logs.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="p-20 text-center text-gray-600">
                                            <div className="flex flex-col items-center gap-2 opacity-50">
                                                <Activity className="h-8 w-8 mb-2" />
                                                <p>No telemetry data available.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    logs.map((log: LogEntry) => (
                                        <tr key={log.id} className="border-b border-gray-800/50 hover:bg-white/[0.02] transition-colors group">
                                            <td className="p-4 whitespace-nowrap text-gray-500">
                                                {format(new Date(log.timestamp), 'dd/MM/yy HH:mm:ss')}
                                            </td>
                                            <td className="p-4">
                                                <span className={`
                                                    font-black text-[9px] px-2 py-0.5 rounded-full border
                                                    ${log.level === 'error' ? 'text-red-500 bg-red-500/5 border-red-500/20' :
                                                        log.level === 'warn' ? 'text-yellow-500 bg-yellow-500/5 border-yellow-500/20' :
                                                            'text-blue-500 bg-blue-500/5 border-blue-500/20'}
                                                `}>
                                                    {log.level.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="p-4 text-gray-300 max-w-md truncate group-hover:text-white" title={log.message}>
                                                {log.message}
                                            </td>
                                            <td className="p-4 text-gray-600 font-mono italic">
                                                {log.meta ? JSON.stringify(log.meta).slice(0, 40) + '...' : '[]'}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <footer className="mt-12 mb-8 text-center">
                    <p className="text-[10px] text-gray-600 font-bold uppercase tracking-[0.2em]">
                        &copy; {new Date().getFullYear()} CampFlow Core Operations &bull; Restricted Access
                    </p>
                </footer>
            </div>
        </div>
    );
}
