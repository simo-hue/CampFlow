import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase/server';
import { format } from 'date-fns';
import { logoutAction } from './login/actions';
import { getAuthStatus } from './login/actions';

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
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${colors[status]}`}>
            {status.toUpperCase()}
        </span>
    );
}

// -- Data Fetching --
async function getLogs() {
    const supabase = supabaseAdmin;
    // Default to last 50 logs of error/warn
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
        const { count, error } = await supabase.from('app_logs').select('*', { count: 'exact', head: true });
        const end = performance.now();

        if (error) throw error;

        return {
            status: 'healthy' as const,
            latency: Math.round(end - start),
            message: 'Connected to Supabase'
        };
    } catch (err: any) {
        return {
            status: 'error' as const,
            latency: 0,
            message: `Connection Failed: ${err.message}`
        };
    }
}

export default async function SysMonitorPage() {
    // 1. Auth Check
    const isAuthed = await getAuthStatus();
    if (!isAuthed) {
        redirect('/sys-monitor/login');
    }

    // 2. Load Data
    const dbHealth = await checkDbConnection();
    const logs = await getLogs();

    return (
        <div className="min-h-screen bg-gray-950 text-gray-200 font-mono text-sm p-8">
            <header className="flex justify-between items-center mb-8 border-b border-gray-800 pb-4">
                <h1 className="text-xl font-bold text-white flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    DEV_MONITOR_DASHBOARD
                </h1>

                <form action={logoutAction}>
                    <button className="text-gray-500 hover:text-white transition-colors">
                        [ LOGOUT ]
                    </button>
                </form>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Panel 1: System Health */}
                <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                    <h2 className="text-gray-400 font-semibold mb-4 uppercase text-xs tracking-wider">System Health</h2>

                    <div className="space-y-3">
                        <div className="flex justify-between items-center py-2 border-b border-gray-800">
                            <span>Database</span>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">{dbHealth.latency}ms</span>
                                <StatusBadge status={dbHealth.status as any} />
                            </div>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-800">
                            <span>Environment</span>
                            <span className="text-xs text-gray-500">{process.env.NODE_ENV}</span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                            <span>Vercel Region</span>
                            <span className="text-xs text-gray-500">{process.env.VERCEL_REGION || 'local'}</span>
                        </div>
                    </div>
                </div>

                {/* Panel 2: Env Vars Check (Masked) */}
                <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                    <h2 className="text-gray-400 font-semibold mb-4 uppercase text-xs tracking-wider">Configuration Check</h2>

                    <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                            <span>NEXT_PUBLIC_SUPABASE_URL</span>
                            <span className={process.env.NEXT_PUBLIC_SUPABASE_URL ? 'text-green-500' : 'text-red-500'}>
                                {process.env.NEXT_PUBLIC_SUPABASE_URL ? 'LOADED' : 'MISSING'}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span>SUPABASE_SERVICE_ROLE_KEY</span>
                            <span className={process.env.SUPABASE_SERVICE_ROLE_KEY ? 'text-green-500' : 'text-red-500'}>
                                {process.env.SUPABASE_SERVICE_ROLE_KEY ? 'LOADED' : 'MISSING'}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span>ADMIN_USERNAME</span>
                            <span className={process.env.ADMIN_USERNAME ? 'text-green-500' : 'text-red-500'}>
                                {process.env.ADMIN_USERNAME ? 'LOADED' : 'MISSING'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Panel 3: Logs */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
                <div className="p-4 border-b border-gray-800 flex justify-between items-center">
                    <h2 className="text-gray-400 font-semibold uppercase text-xs tracking-wider">Application Logs (Last 50)</h2>
                    <div className="flex items-center gap-4">
                        <span className="text-xs text-gray-600">Auto-refresh on reload</span>
                        <form action={async () => {
                            'use server';
                            const { cleanLogsAction } = await import('./login/actions');
                            await cleanLogsAction();
                        }}>
                            <button className="text-xs bg-gray-800 hover:bg-yellow-500/20 text-gray-400 hover:text-yellow-400 px-3 py-1.5 rounded transition-colors border border-gray-700 hover:border-yellow-500/30">
                                Clean Old Logs (&gt;30d)
                            </button>
                        </form>
                        <form action={async () => {
                            'use server';
                            const { clearAllLogsAction } = await import('./login/actions');
                            await clearAllLogsAction();
                        }}>
                            <button className="text-xs bg-gray-800 hover:bg-red-500/20 text-red-500 hover:text-red-400 px-3 py-1.5 rounded transition-colors border border-gray-700 hover:border-red-500/30 font-bold">
                                [RESET] Clear All
                            </button>
                        </form>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-950 text-gray-500 text-xs text-left">
                                <th className="p-3 font-medium border-b border-gray-800">Time</th>
                                <th className="p-3 font-medium border-b border-gray-800">Level</th>
                                <th className="p-3 font-medium border-b border-gray-800">Message</th>
                                <th className="p-3 font-medium border-b border-gray-800">Meta</th>
                            </tr>
                        </thead>
                        <tbody className="text-xs">
                            {logs.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="p-8 text-center text-gray-600">No logs found. Everything seems quiet.</td>
                                </tr>
                            ) : (
                                logs.map((log: LogEntry) => (
                                    <tr key={log.id} className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors">
                                        <td className="p-3 whitespace-nowrap text-gray-500">
                                            {format(new Date(log.timestamp), 'dd/MM/yy HH:mm:ss')}
                                        </td>
                                        <td className="p-3">
                                            <span className={`
                                                uppercase font-bold text-[10px] px-1.5 py-0.5 rounded
                                                ${log.level === 'error' ? 'text-red-400 bg-red-900/30' :
                                                    log.level === 'warn' ? 'text-yellow-400 bg-yellow-900/30' :
                                                        'text-blue-400 bg-blue-900/30'}
                                            `}>
                                                {log.level}
                                            </span>
                                        </td>
                                        <td className="p-3 text-gray-300 max-w-md truncate" title={log.message}>
                                            {log.message}
                                        </td>
                                        <td className="p-3 text-gray-500 font-mono">
                                            {log.meta ? JSON.stringify(log.meta).slice(0, 50) + (JSON.stringify(log.meta).length > 50 ? '...' : '') : '-'}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
