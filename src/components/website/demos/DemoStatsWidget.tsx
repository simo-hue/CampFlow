'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useState, useEffect } from 'react';

export function DemoStatsWidget() {
    const [animatedOccupancy, setAnimatedOccupancy] = useState(0);

    // Simulate real-time updates
    useEffect(() => {
        const interval = setInterval(() => {
            // Randomize slightly to simulating live data
            const random = Math.floor(Math.random() * 5) + 80;
            setAnimatedOccupancy(random);
        }, 3000);
        setAnimatedOccupancy(82); // Initial
        return () => clearInterval(interval);
    }, []);

    const data = [
        { name: 'Lun', occupazione: 65 },
        { name: 'Mar', occupazione: 50 },
        { name: 'Mer', occupazione: 60 },
        { name: 'Gio', occupazione: 75 },
        { name: 'Ven', occupazione: 85 },
        { name: 'Sab', occupazione: 95 },
        { name: 'Dom', occupazione: 90 },
    ];

    return (
        <div className="grid gap-4 w-full">
            <div className="grid grid-cols-2 gap-4">
                {/* Stats Card 1 */}
                <Card className="border-l-4 border-l-green-500">
                    <CardHeader className="pb-2 p-4">
                        <CardTitle className="text-xs font-medium text-muted-foreground">
                            📥 Arrivi Oggi
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <div className="text-2xl font-bold">12</div>
                        <p className="text-[10px] text-muted-foreground">Check-in previsti</p>
                    </CardContent>
                </Card>

                {/* Stats Card 2 */}
                <Card className="border-l-4 border-l-purple-500">
                    <CardHeader className="pb-2 p-4">
                        <CardTitle className="text-xs font-medium text-muted-foreground flex justify-between items-center">
                            <span>📊 Occ.</span>
                            <Badge variant="secondary" className="text-[10px] px-1 pointer-events-none transition-all duration-300">
                                {animatedOccupancy}%
                            </Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <div className="text-2xl font-bold mb-1 transition-all duration-300">{animatedOccupancy}/100</div>
                        <Progress value={animatedOccupancy} className="h-1.5" />
                    </CardContent>
                </Card>
            </div>

            {/* Weekly Chart */}
            <Card>
                <CardHeader className="pb-2 p-4">
                    <CardTitle className="text-sm">Previsione Settimanale</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 h-[150px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data}>
                            <XAxis
                                dataKey="name"
                                stroke="#888888"
                                fontSize={10}
                                tickLine={false}
                                axisLine={false}
                            />
                            <Tooltip
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', backgroundColor: '#fff' }}
                                labelStyle={{ fontWeight: 'bold', color: '#000' }}
                                itemStyle={{ color: '#000' }}
                            />
                            <Line
                                type="monotone"
                                dataKey="occupazione"
                                stroke="currentColor"
                                strokeWidth={2}
                                dot={{ r: 4, fill: "currentColor" }}
                                activeDot={{ r: 6 }}
                                className="stroke-primary fill-primary"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    );
}
