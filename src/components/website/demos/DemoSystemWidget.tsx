'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Terminal, Activity, Database, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

export function DemoSystemWidget() {
    const [logs, setLogs] = useState<string[]>([]);
    const [metrics, setMetrics] = useState({ cpu: 12, memory: 34, db: 'Healthy' });
    const logContainerRef = useRef<HTMLDivElement>(null);

    const possibleLogs = [
        "[INFO] Incoming request: GET /api/stats",
        "[INFO] Database query executed in 12ms",
        "[METRICS] CPU Load: 14% - Memory: 35%",
        "[AUDIT] User 'admin' updated booking #1234",
        "[INFO] Real-time updates pushed to client",
        "[JOB] Daily backup completed successfully",
        "[SECURITY] Scan passed: No vulnerabilities found",
        "[INFO] Cache hit for key: occupancy_sector_A",
        "[SYSTEM] All systems operational"
    ];

    useEffect(() => {
        // Initial logs
        setLogs([
            "[SYSTEM] CampFlow Server v2.0.1 started",
            "[INFO] Connecting to Supabase instance...",
            "[INFO] Connection established successfully.",
            "[INFO] Background jobs scheduler initialized.",
        ]);

        const interval = setInterval(() => {
            const randomLog = possibleLogs[Math.floor(Math.random() * possibleLogs.length)];
            const timestamp = new Date().toLocaleTimeString('it-IT', { hour12: false });

            setLogs(prev => {
                const newLogs = [...prev, `[${timestamp}] ${randomLog}`];
                if (newLogs.length > 8) return newLogs.slice(newLogs.length - 8);
                return newLogs;
            });

            // Randomize metrics slightly
            setMetrics(prev => ({
                ...prev,
                cpu: Math.min(100, Math.max(5, prev.cpu + (Math.random() > 0.5 ? 2 : -2))),
                memory: Math.min(100, Math.max(20, prev.memory + (Math.random() > 0.5 ? 1 : -1)))
            }));

        }, 2000);

        return () => clearInterval(interval);
    }, []);

    // Auto scroll
    useEffect(() => {
        if (logContainerRef.current) {
            logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
        }
    }, [logs]);

    return (
        <Card className="w-full border shadow-lg overflow-hidden flex flex-col min-h-[400px] bg-zinc-950 text-zinc-50">
            {/* Header / Toolbar */}
            <div className="flex items-center justify-between p-3 px-4 border-b border-zinc-800 bg-zinc-900/50">
                <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-emerald-500" />
                    <span className="text-xs font-mono font-medium text-zinc-400">root@campflow-server:~</span>
                </div>
                <div className="flex gap-2">
                    <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 text-[10px] bg-emerald-500/10 h-5 px-1.5 gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Online
                    </Badge>
                </div>
            </div>

            {/* Metrics Dashboard */}
            <div className="grid grid-cols-3 divide-x divide-zinc-800 border-b border-zinc-800 bg-zinc-900/20">
                <div className="p-3 flex flex-col items-center">
                    <span className="text-[10px] uppercase text-zinc-500 font-bold mb-1">CPU Load</span>
                    <div className="flex items-center gap-1.5 text-zinc-200">
                        <Activity className="w-4 h-4 text-blue-400" />
                        <span className="font-mono font-bold">{metrics.cpu}%</span>
                    </div>
                </div>
                <div className="p-3 flex flex-col items-center">
                    <span className="text-[10px] uppercase text-zinc-500 font-bold mb-1">Memory</span>
                    <div className="flex items-center gap-1.5 text-zinc-200">
                        <Database className="w-4 h-4 text-purple-400" />
                        <span className="font-mono font-bold">{metrics.memory}%</span>
                    </div>
                </div>
                <div className="p-3 flex flex-col items-center">
                    <span className="text-[10px] uppercase text-zinc-500 font-bold mb-1">Security</span>
                    <div className="flex items-center gap-1.5 text-zinc-200">
                        <ShieldCheck className="w-4 h-4 text-green-400" />
                        <span className="font-mono font-bold">Secure</span>
                    </div>
                </div>
            </div>

            {/* Terminal Output */}
            <div ref={logContainerRef} className="flex-1 p-4 font-mono text-xs overflow-y-auto space-y-1.5 scroll-smooth">
                {logs.map((log, i) => (
                    <div key={i} className="flex gap-2 animate-in fade-in slide-in-from-left-2 duration-300">
                        <span className="text-zinc-600 select-none">$</span>
                        <span className={
                            log.includes("[ERROR]") ? "text-red-400" :
                                log.includes("[WARN]") ? "text-yellow-400" :
                                    log.includes("[METRICS]") ? "text-blue-300" :
                                        log.includes("[SECURITY]") ? "text-green-300" :
                                            "text-zinc-300"
                        }>
                            {log}
                        </span>
                    </div>
                ))}
                <div className="animate-pulse text-emerald-500">_</div>
            </div>
        </Card>
    );
}
