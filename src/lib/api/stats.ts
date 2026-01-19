import { supabase } from '@/lib/supabase/client';
import { Booking, BookingWithDetails, Customer } from '@/lib/types';
import { eachDayOfInterval, format, isWithinInterval, parseISO, subDays, differenceInCalendarDays } from 'date-fns';

export interface StatsData {
    kpi: {
        revenue: number;
        occupancyRate: number;
        totalBookings: number;
        averageStay: number;
        revenueTrend: number; // percentage vs previous period
        occupancyTrend: number;
        bookingsTrend: number;
    };
    charts: {
        revenueByDate: { date: string; value: number }[];
        occupancyByDate: { date: string; value: number }[];
        nationalityDistribution: { name: string; value: number; fill: string }[];
        guestTypeDistribution: { name: string; value: number; fill: string }[];
    };
}

const COLORS = [
    'var(--color-chart-1)',
    'var(--color-chart-2)',
    'var(--color-chart-3)',
    'var(--color-chart-4)',
    'var(--color-chart-5)',
];

export async function fetchStats(startDate: Date, endDate: Date): Promise<StatsData> {

    // 1. Fetch Bookings overlapping the range
    // We check if booking_period overlaps with [startDate, endDate]
    // Since booking_period is a string range, we might fetch more and filter in JS for simplicity unless dataset is huge.
    // For now, let's fetch all active bookings (confirmed, checked_in, checked_out)

    const { data: bookingsData, error } = await supabase
        .from('bookings')
        .select(`
            *,
            pitch:pitches(*),
            customer:customers(*)
        `)
        .in('status', ['confirmed', 'checked_in', 'checked_out']);

    if (error) throw error;

    const bookings = bookingsData as BookingWithDetails[];

    // Filter bookings relevant to the date range
    const relevantBookings = bookings.filter(b => {
        // Parse range "[2026-01-01 00:00:00, 2026-01-05 00:00:00)"
        const [startStr, endStr] = b.booking_period.replace(/[\[\)]/g, '').split(',');
        const bStart = parseISO(startStr);
        const bEnd = parseISO(endStr);

        return (
            (bStart <= endDate && bStart >= startDate) ||
            (bEnd <= endDate && bEnd >= startDate) ||
            (bStart <= startDate && bEnd >= endDate)
        );
    });

    // 2. Calculate KPIs
    let totalRevenue = 0;
    let totalNights = 0;
    let totalStayDuration = 0;

    const daysMap = new Map<string, { revenue: number; occupied: number }>();

    // Initialize days map
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    days.forEach(day => {
        daysMap.set(format(day, 'yyyy-MM-dd'), { revenue: 0, occupied: 0 });
    });

    relevantBookings.forEach(booking => {
        const [startStr, endStr] = booking.booking_period.replace(/[\[\)]/g, '').split(',');
        const bStart = parseISO(startStr);
        const bEnd = parseISO(endStr);

        // Calculate revenue overlap
        // Simplification: Pro-rate revenue per day? Or just verify if check-in is in range? 
        // For accurate charts: Pro-rate revenue per day.

        const nights = differenceInCalendarDays(bEnd, bStart);
        const dailyRevenue = booking.total_price / Math.max(1, nights);

        // Iterate days of booking
        let current = bStart;
        while (current < bEnd) {
            const dayStr = format(current, 'yyyy-MM-dd');
            if (daysMap.has(dayStr)) {
                const entry = daysMap.get(dayStr)!;
                entry.revenue += dailyRevenue;
                entry.occupied += 1;
                daysMap.set(dayStr, entry);
            }
            current = new Date(current.setDate(current.getDate() + 1));
        }

        // For total KPI, just sum total_price if check-in is in range? 
        // Or sum daily revenue for days in range? 
        // "Accrual basis" is better for charts.
    });

    // Aggregate Map to Arrays
    const revenueByDate = Array.from(daysMap.entries()).map(([date, data]) => ({
        date,
        value: Math.round(data.revenue * 100) / 100
    }));

    const occupancyByDate = Array.from(daysMap.entries()).map(([date, data]) => ({
        date,
        value: data.occupied
    }));

    // KPIs sums from the map (precise for the range)
    totalRevenue = Array.from(daysMap.values()).reduce((sum, d) => sum + d.revenue, 0);
    // Occupancy Rate: Total Occupied Pitch-Days / (Total Pitches * Days in Range)
    // We need total pitches count.
    const { count: pitchesCount } = await supabase.from('pitches').select('*', { count: 'exact', head: true });
    const totalCapacity = (pitchesCount || 1) * days.length;
    const totalOccupiedParam = Array.from(daysMap.values()).reduce((sum, d) => sum + d.occupied, 0);
    const occupancyRate = (totalOccupiedParam / totalCapacity) * 100;

    const rangeBookingsCount = relevantBookings.length; // Approximate, bookings touching the range

    // Avg Stay
    const totalDuration = relevantBookings.reduce((sum, b) => {
        const [startStr, endStr] = b.booking_period.replace(/[\[\)]/g, '').split(',');
        return sum + differenceInCalendarDays(parseISO(endStr), parseISO(startStr));
    }, 0);
    const averageStay = rangeBookingsCount > 0 ? totalDuration / rangeBookingsCount : 0;

    // Demographics
    const countryStats: Record<string, number> = {};
    for (const b of relevantBookings) {
        // Use customer residence country or passport country
        const country = b.customer?.residence_country || b.customer?.citizenship || 'Unknown';
        countryStats[country] = (countryStats[country] || 0) + 1;
    }

    const nationalityDistribution = Object.entries(countryStats)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5) // Top 5
        .map(([name, value], index) => ({
            name,
            value,
            fill: COLORS[index % COLORS.length]
        }));

    return {
        kpi: {
            revenue: Math.round(totalRevenue),
            occupancyRate: Math.round(occupancyRate),
            totalBookings: rangeBookingsCount,
            averageStay: Math.round(averageStay * 10) / 10,
            revenueTrend: 0, // TODO: calculate previous period
            occupancyTrend: 0,
            bookingsTrend: 0
        },
        charts: {
            revenueByDate,
            occupancyByDate,
            nationalityDistribution,
            guestTypeDistribution: [] // TODO if we have guest data
        }
    };
}
