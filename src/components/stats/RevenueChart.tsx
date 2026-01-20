"use client";

import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import { format, parseISO } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

interface RevenueChartProps {
    data: { date: string; value: number }[];
    action?: React.ReactNode;
}

export function RevenueChart({ data, action }: RevenueChartProps) {
    // Calculate gradient offset based on today's position
    const calculateOffset = () => {
        if (!data || data.length === 0) return 0;

        const today = new Date();
        const start = parseISO(data[0].date).getTime();
        const end = parseISO(data[data.length - 1].date).getTime();
        const current = today.getTime();

        if (current <= start) return 0;
        if (current >= end) return 1;

        return (current - start) / (end - start);
    };

    const offset = calculateOffset();

    return (
        <Card className="col-span-4 flex flex-col h-full min-w-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle>Andamento Ricavi</CardTitle>
                {action}
            </CardHeader>
            <CardContent className="pl-2 flex-1 min-h-0">
                <div className="h-[300px] w-full min-w-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data}>
                            <defs>
                                <linearGradient id="colorRevenueFill" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorRevenueStroke" x1="0" y1="0" x2="1" y2="0">
                                    <stop offset={offset} stopColor="var(--color-primary)" stopOpacity={1} />
                                    <stop offset={offset} stopColor="var(--color-primary)" stopOpacity={0.3} />
                                </linearGradient>
                            </defs>
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
                                tickFormatter={(value) => formatCurrency(value)}
                            />
                            <Tooltip
                                formatter={(value: any) => [formatCurrency(value), "Ricavi"]}
                                labelFormatter={(label) => format(parseISO(label), "d MMMM yyyy")}
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
                            />
                            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--color-border)" />
                            <Area
                                type="monotone"
                                dataKey="value"
                                stroke="url(#colorRevenueStroke)"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#colorRevenueFill)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
