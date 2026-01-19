"use client";

import {
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import { format, parseISO } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface OccupancyChartProps {
    data: { date: string; value: number }[];
}

export function OccupancyChart({ data }: OccupancyChartProps) {
    return (
        <Card className="col-span-4 flex flex-col h-full min-w-0">
            <CardHeader>
                <CardTitle>Occupazione Giornaliera</CardTitle>
            </CardHeader>
            <CardContent className="pl-2 flex-1 min-h-0">
                <div className="h-[300px] w-full min-w-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data}>
                            <XAxis
                                dataKey="date"
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
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
                                cursor={{ fill: 'transparent' }}
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                labelFormatter={(label) => format(parseISO(label), "d MMMM yyyy")}
                            />
                            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--color-border)" />
                            <Bar
                                dataKey="value"
                                fill="var(--color-chart-1)"
                                radius={[4, 4, 0, 0]}
                                name="Piazzole Occupate"
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
