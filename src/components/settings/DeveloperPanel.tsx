'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Database, HardDrive, Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface TableStat {
    table_name: string;
    row_count: number;
    total_size: string;
    table_size: string;
    indexes_size: string;
    total_size_bytes: number;
}

interface DatabaseSummary {
    total_size_bytes: number;
    total_size_pretty: string;
    total_tables: number;
    data_source?: 'accurate' | 'estimated';
}

export function DeveloperPanel() {
    const [loading, setLoading] = useState(false);
    const [tableStats, setTableStats] = useState<TableStat[]>([]);
    const [summary, setSummary] = useState<DatabaseSummary | null>(null);
    const [recordCounts, setRecordCounts] = useState<Record<string, number>>({});

    const fetchDbStats = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/dev/db-stats');
            if (!response.ok) throw new Error('Failed to fetch');

            const data = await response.json();
            setTableStats(data.tables || []);
            setSummary(data.summary || null);
            setRecordCounts(data.recordCounts || {});
            toast.success('Database statistics updated');
        } catch (error) {
            console.error('Error fetching database stats:', error);
            toast.error('Failed to fetch database statistics');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDbStats();
    }, []);

    // Storage constants
    const STORAGE_LIMIT_MB = 500;
    const totalBytes = summary?.total_size_bytes || 0;
    const totalMB = totalBytes / (1024 * 1024);
    const usagePercentage = (totalMB / STORAGE_LIMIT_MB) * 100;
    const availableMB = STORAGE_LIMIT_MB - totalMB;

    // Color based on usage
    const getStorageColor = () => {
        if (usagePercentage < 50) return 'bg-green-500';
        if (usagePercentage < 80) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold">Database Storage Monitor</h3>
                    <p className="text-sm text-muted-foreground">
                        Real-time storage usage and table statistics
                    </p>
                </div>
                <Button
                    onClick={fetchDbStats}
                    disabled={loading}
                    variant="outline"
                    size="sm"
                >
                    {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <RefreshCw className="h-4 w-4" />
                    )}
                    <span className="ml-2">Refresh</span>
                </Button>
            </div>

            {/* Storage Overview Card */}
            <Card className="border-2 bg-gradient-to-br from-background to-muted/20">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <HardDrive className="h-5 w-5" />
                            Storage Usage
                        </CardTitle>
                        {summary?.data_source && (
                            <span className={`text-xs px-2 py-1 rounded-full ${summary.data_source === 'accurate'
                                    ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                                    : 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400'
                                }`}>
                                {summary.data_source === 'accurate' ? '✓ Accurate' : '≈ Estimated'}
                            </span>
                        )}
                    </div>
                    <CardDescription>
                        Monitor your database storage consumption
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Size Display */}
                    <div className="flex items-baseline justify-between">
                        <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Total Size</p>
                            <p className="text-4xl font-bold">
                                {summary?.total_size_pretty || '0 B'}
                            </p>
                        </div>
                        <div className="text-right space-y-1">
                            <p className="text-sm text-muted-foreground">Limit</p>
                            <p className="text-2xl font-semibold text-muted-foreground">
                                {STORAGE_LIMIT_MB} MB
                            </p>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                        <div className="h-4 w-full bg-muted rounded-full overflow-hidden">
                            <div
                                className={`h-full transition-all duration-500 ${getStorageColor()}`}
                                style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                            />
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                                {usagePercentage.toFixed(1)}% used
                            </span>
                            <span className="text-muted-foreground">
                                {availableMB.toFixed(0)} MB available
                            </span>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                        <div>
                            <p className="text-sm text-muted-foreground">Total Tables</p>
                            <p className="text-2xl font-semibold">{summary?.total_tables || 0}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Total Records</p>
                            <p className="text-2xl font-semibold">
                                {Object.values(recordCounts).reduce((a, b) => a + b, 0).toLocaleString()}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Table Statistics */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Database className="h-5 w-5" />
                        Tables Breakdown
                    </CardTitle>
                    <CardDescription>
                        Storage details for each table
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-[500px] pr-4">
                        <div className="space-y-3">
                            {tableStats.map((table) => (
                                <div
                                    key={table.table_name}
                                    className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                                >
                                    <div className="space-y-1 flex-1">
                                        <p className="font-medium">{table.table_name}</p>
                                        <div className="flex gap-4 text-sm text-muted-foreground">
                                            <span>{recordCounts[table.table_name]?.toLocaleString() || '0'} rows</span>
                                            <span>•</span>
                                            <span>Table: {table.table_size}</span>
                                            <span>•</span>
                                            <span>Indexes: {table.indexes_size}</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-semibold">{table.total_size}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {((table.total_size_bytes / totalBytes) * 100).toFixed(1)}%
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>

            {/* Info Banner */}
            <Card className="border-blue-500/50 bg-blue-500/5">
                <CardContent className="pt-6">
                    <div className="flex gap-3">
                        <Database className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                        <div className="space-y-2">
                            <p className="font-medium">Storage Monitoring Tips</p>
                            <ul className="text-sm text-muted-foreground space-y-1">
                                <li>• Keep usage below 80% for optimal performance</li>
                                <li>• <code className="bg-muted px-1 py-0.5 rounded">booking_guests</code> table typically uses 60-70% of total storage</li>
                                <li>• Consider archiving old bookings if storage grows too high</li>
                                <li>• Refresh regularly to monitor growth trends</li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
