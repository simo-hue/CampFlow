'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LineChart, Line, ResponsiveContainer, AreaChart, Area, XAxis, Tooltip } from 'recharts';
import {
    Users,
    Calendar,
    ArrowUpRight,
    ArrowDownRight,
    Bell,
    Search,
    Menu,
    CheckCircle2,
    LogOut,
    LogIn,
    MoreHorizontal
} from 'lucide-react';
import { useState, useEffect } from 'react';

export function DemoHeroDashboard() {
    const [scrolled, setScrolled] = useState(false);
    const [selectedTab, setSelectedTab] = useState('overview');

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const timer = setInterval(() => {
            setScrolled(s => !s);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    // Mock Data for Charts
    const dailyTraffic = [
        { time: '08:00', value: 12 },
        { time: '10:00', value: 18 },
        { time: '12:00', value: 45 },
        { time: '14:00', value: 32 },
        { time: '16:00', value: 55 },
        { time: '18:00', value: 48 },
        { time: '20:00', value: 30 },
    ];

    const weeklyData = [
        { day: 'Lun', value: 45 },
        { day: 'Mar', value: 52 },
        { day: 'Mer', value: 48 },
        { day: 'Gio', value: 61 },
        { day: 'Ven', value: 85 },
        { day: 'Sab', value: 92 },
        { day: 'Dom', value: 88 },
    ];

    return (
        <div className="w-full h-full bg-background/50 backdrop-blur-xl border rounded-xl overflow-hidden shadow-2xl flex flex-col">
            {/* Fake Browser Toolbar */}
            <div className="h-10 bg-muted/40 border-b flex items-center px-4 gap-2">
                <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                    <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <div className="flex-1 text-center text-xs font-medium text-muted-foreground/50">
                    dashboard.campflow.app
                </div>
                <div className="w-16" /> {/* Spacer for balance */}
            </div>

            {/* App Header */}
            <div className="h-16 border-b flex items-center justify-between px-6 bg-background/80">
                <div className="flex items-center gap-6">
                    <div className="font-bold text-xl flex items-center gap-2 text-primary">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                                <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
                            </svg>
                        </div>
                        CampFlow
                    </div>
                    <div className="hidden md:flex items-center gap-1 text-sm font-medium text-muted-foreground">
                        <Button variant="ghost" size="sm" className="text-foreground">Dashboard</Button>
                        <Button variant="ghost" size="sm">Planning</Button>
                        <Button variant="ghost" size="sm">Ospiti</Button>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative hidden sm:block">
                        <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-muted-foreground" />
                        <div className="h-9 w-64 rounded-md border bg-muted/50 pl-9 text-sm flex items-center text-muted-foreground">
                            Cerca prenotazione...
                        </div>
                    </div>
                    <Button size="icon" variant="ghost" className="relative">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 ring-2 ring-background" />
                    </Button>
                    <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30" />
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 p-6 overflow-hidden bg-muted/5 relative">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">

                    {/* Left Column: Stats */}
                    <div className="md:col-span-2 space-y-6">
                        {/* Summary Cards */}
                        <div className="grid grid-cols-3 gap-4">
                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <p className="text-xs text-muted-foreground font-medium">ARRIVI OGGI</p>
                                        <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-0">
                                            +12%
                                        </Badge>
                                    </div>
                                    <div className="text-2xl font-bold">24</div>
                                    <div className="flex -space-x-2 mt-3">
                                        {[1, 2, 3, 4].map(i => (
                                            <div key={i} className="w-6 h-6 rounded-full border-2 border-background bg-zinc-200" />
                                        ))}
                                        <div className="w-6 h-6 rounded-full border-2 border-background bg-zinc-100 flex items-center justify-center text-[10px] font-medium">+20</div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <p className="text-xs text-muted-foreground font-medium">OCCUPAZIONE</p>
                                        <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 border-0">
                                            Alta
                                        </Badge>
                                    </div>
                                    <div className="text-2xl font-bold">87%</div>
                                    <div className="h-1.5 w-full bg-muted mt-4 rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-500 w-[87%] rounded-full" />
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <p className="text-xs text-muted-foreground font-medium">INCASSI</p>
                                        <Badge variant="secondary" className="bg-orange-500/10 text-orange-600 border-0">
                                            In linea
                                        </Badge>
                                    </div>
                                    <div className="text-2xl font-bold">€2.4k</div>
                                    <div className="h-[24px] mt-2">
                                        <ResponsiveContainer width="100%" height="100%">
                                            {mounted ? (
                                                <AreaChart data={dailyTraffic}>
                                                    <Area type="monotone" dataKey="value" stroke="none" fill="#f97316" fillOpacity={0.2} />
                                                </AreaChart>
                                            ) : (
                                                <div />
                                            )}
                                        </ResponsiveContainer>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Main Chart Card */}
                        <Card className="h-[280px]">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">Andamento Settimanale</CardTitle>
                                <div className="flex gap-1">
                                    <div className="w-2 h-2 rounded-full bg-primary" />
                                    <div className="w-2 h-2 rounded-full bg-muted" />
                                </div>
                            </CardHeader>
                            <CardContent className="h-[220px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    {mounted ? (
                                        <LineChart data={weeklyData}>
                                            <Tooltip
                                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', backgroundColor: '#fff', color: '#000' }}
                                                labelStyle={{ fontWeight: 'bold', color: '#000' }}
                                                itemStyle={{ color: '#000' }}
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="value"
                                                stroke="currentColor"
                                                strokeWidth={3}
                                                dot={{ r: 4, strokeWidth: 0, fill: "currentColor" }}
                                                activeDot={{ r: 6, strokeWidth: 0 }}
                                                className="text-primary"
                                            />
                                            <XAxis
                                                dataKey="day"
                                                axisLine={false}
                                                tickLine={false}
                                                fontSize={12}
                                                tick={{ fill: '#ffffff', opacity: 0.8 }}
                                            />
                                        </LineChart>
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-muted-foreground/50 text-xs">
                                            Caricamento...
                                        </div>
                                    )}
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: Activity Feed */}
                    <div className="space-y-4">
                        <Card className="h-full flex flex-col">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium">Attività Recenti</CardTitle>
                            </CardHeader>
                            <CardContent className="flex-1 overflow-hidden relative">
                                <div className="absolute inset-0 p-6 pt-0 space-y-6">
                                    {[
                                        { user: 'Marco B.', action: 'Nuovo Check-in', time: '2 min fa', icon: LogIn, color: 'text-green-500', bg: 'bg-green-500/10' },
                                        { user: 'System', action: 'Backup Completato', time: '15 min fa', icon: CheckCircle2, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                                        { user: 'Giulia R.', action: 'Check-out Piazzola 12', time: '32 min fa', icon: LogOut, color: 'text-orange-500', bg: 'bg-orange-500/10' },
                                        { user: 'Admin', action: 'Modifica Listino', time: '1h fa', icon: MoreHorizontal, color: 'text-zinc-500', bg: 'bg-zinc-500/10' },
                                        { user: 'Luca T.', action: 'Nuova Prenotazione', time: '2h fa', icon: Calendar, color: 'text-purple-500', bg: 'bg-purple-500/10' },
                                    ].map((item, i) => (
                                        <div key={i} className="flex gap-4 items-start group cursor-pointer hover:bg-muted/50 p-2 rounded-lg -mx-2 transition-colors">
                                            <div className={`w-8 h-8 rounded-full ${item.bg} flex items-center justify-center shrink-0`}>
                                                <item.icon className={`w-4 h-4 ${item.color}`} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium leading-none mb-1 group-hover:text-primary transition-colors">{item.action}</p>
                                                <p className="text-xs text-muted-foreground truncate">
                                                    <span className="font-semibold text-foreground/70">{item.user}</span> • {item.time}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Floating Notification Toast Simulation */}
                <div className="absolute bottom-6 right-6 animate-in slide-in-from-bottom duration-700 delay-1000">
                    <div className="bg-popover text-popover-foreground border shadow-lg rounded-lg p-4 flex gap-3 items-center max-w-xs">
                        <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-600">
                            <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold">Sincronizzazione completata</p>
                            <p className="text-xs text-muted-foreground">Tutti i dati sono aggiornati.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
