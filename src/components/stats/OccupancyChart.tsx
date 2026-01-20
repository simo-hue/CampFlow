"use client";

import {
    Line,
    LineChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
    Legend,
} from "recharts";
import { format, parseISO } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface OccupancyChartProps {
    data: { date: string; piazzola: number; tenda: number; total: number }[];
    title?: string;
    action?: React.ReactNode;
}

export function OccupancyChart({ data, title = "Occupazione Giornaliera", action }: OccupancyChartProps) {
    return (
        <Card className="col-span-4 flex flex-col h-full min-w-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base font-normal">{title}</CardTitle>
                {action}
            </CardHeader>
            <CardContent className="pl-2 flex-1 min-h-0">
                <div className="h-[300px] w-full min-w-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data}>
                            <XAxis
                                dataKey="date"
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                minTickGap={30}
                                tickFormatter={(str) => {
                                    const date = parseISO(str);
                                    return format(date, "d MMM");
                                }}
                            />
                            <YAxis
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'hsl(var(--card))',
                                    color: 'hsl(var(--foreground))',
                                    borderRadius: '0.5rem',
                                    border: '1px solid hsl(var(--border))',
                                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                    padding: '8px 12px',
                                }}
                                labelStyle={{
                                    color: 'hsl(var(--muted-foreground))',
                                    marginBottom: '0.25rem',
                                    fontSize: '0.875rem',
                                }}
                                itemStyle={{
                                    paddingTop: '0.25rem',
                                    fontSize: '0.875rem',
                                    fontWeight: 500
                                }}
                                labelFormatter={(label) => format(parseISO(label), "d MMMM yyyy")}
                            />
                            <Legend />
                            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--color-border)" />
                            <Line
                                type="monotone"
                                dataKey="piazzola"
                                name="Piazzola"
                                stroke="#ea580c"
                                strokeWidth={2}
                                dot={false}
                            />
                            <Line
                                type="monotone"
                                dataKey="tenda"
                                name="Tenda"
                                stroke="#02c01eff"
                                strokeWidth={2}
                                dot={false}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
