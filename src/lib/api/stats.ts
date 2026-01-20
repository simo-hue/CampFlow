import { supabase } from '@/lib/supabase/client';
import { Booking, BookingWithDetails, Customer } from '@/lib/types';
import { eachDayOfInterval, format, isWithinInterval, parseISO, subDays, differenceInCalendarDays, startOfDay, endOfDay, addDays } from 'date-fns';

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
        occupancyByDate: { date: string; piazzola: number; tenda: number; total: number }[];
    };
}


export async function fetchStats(startDate: Date, endDate: Date): Promise<StatsData> {

    // 0. Calculate Previous Period
    const durationInDays = differenceInCalendarDays(endDate, startDate) + 1; // +1 to include end date
    const previousEndDate = subDays(startDate, 1);
    const previousStartDate = subDays(previousEndDate, durationInDays - 1);

    // 1. Fetch Bookings overlapping the EXTENDED range [previousStartDate, endDate]
    // We check if booking_period overlaps with [previousStartDate, endDate]
    const queryStartDate = previousStartDate;
    const queryEndDate = endDate;

    const { data: bookingsData, error } = await supabase
        .from('bookings')
        .select(`
            *,
            pitch:pitches(*),
            customer:customers(*)
        `)
        .in('status', ['confirmed', 'checked_in', 'checked_out']); // active statuses

    if (error) throw error;

    const bookings = bookingsData as BookingWithDetails[];

    // Helper: Normalize booking dates
    const getBookingDates = (b: Booking) => {
        const [startStr, endStr] = b.booking_period.replace(/[\[\)]/g, '').split(',');
        return { start: parseISO(startStr), end: parseISO(endStr) };
    };

    // Helper: Filter bookings overlapping a specific range
    const filterBookings = (allBookings: BookingWithDetails[], start: Date, end: Date) => {
        return allBookings.filter(b => {
            const { start: bStart, end: bEnd } = getBookingDates(b);
            return (
                (bStart <= end && bStart >= start) ||
                (bEnd <= end && bEnd >= start) ||
                (bStart <= start && bEnd >= end)
            );
        });
    };

    const currentPeriodBookings = filterBookings(bookings, startDate, endDate);
    const previousPeriodBookings = filterBookings(bookings, previousStartDate, previousEndDate);

    // Helper: Calculate Revenue and Occupancy for a range using daily accrual
    const calculateStatsForRange = (
        rangeBookings: BookingWithDetails[],
        inputStart: Date,
        inputEnd: Date
    ) => {
        let revenue = 0;
        let occupiedDays = 0;

        // Normalize range to ensure we cover full days cleanly
        // This prevents potential issues with times like 23:59:59 causing skipped days in intervals
        const rangeStart = startOfDay(inputStart);
        const rangeEnd = endOfDay(inputEnd);

        // Updated map to track specific occupancy types
        const daysMap = new Map<string, { revenue: number; occupiedPiazzola: number; occupiedTenda: number }>();
        const days = eachDayOfInterval({ start: rangeStart, end: rangeEnd });

        // Init map with all days in range
        days.forEach(day => {
            daysMap.set(format(day, 'yyyy-MM-dd'), { revenue: 0, occupiedPiazzola: 0, occupiedTenda: 0 });
        });

        rangeBookings.forEach(booking => {
            const { start: bStart, end: bEnd } = getBookingDates(booking);
            const nights = differenceInCalendarDays(bEnd, bStart);
            const dailyRevenue = booking.total_price / Math.max(1, nights);
            const pitchType = booking.pitch?.type; // 'piazzola' | 'tenda'

            // Normalize booking dates for comparison loop
            // We need to iterate from booking start
            let current = startOfDay(bStart);
            const limit = startOfDay(bEnd);

            // Iterate days of booking
            while (current < limit) {
                // Check if current day is within our stats range
                if (current >= rangeStart && current <= rangeEnd) {
                    const dayStr = format(current, 'yyyy-MM-dd');
                    if (daysMap.has(dayStr)) {
                        const entry = daysMap.get(dayStr)!;
                        entry.revenue += dailyRevenue;

                        // Increment specific counter
                        if (pitchType === 'piazzola') {
                            entry.occupiedPiazzola += 1;
                        } else if (pitchType === 'tenda') {
                            entry.occupiedTenda += 1;
                        }

                        daysMap.set(dayStr, entry);
                    }
                }
                current = addDays(current, 1);
            }
        });

        revenue = Array.from(daysMap.values()).reduce((sum, d) => sum + d.revenue, 0);
        // Total occupied days is sum of both types
        occupiedDays = Array.from(daysMap.values()).reduce((sum, d) => sum + d.occupiedPiazzola + d.occupiedTenda, 0);

        return { revenue, occupiedDays, daysMap, daysCount: days.length };
    };

    // 2. Calculate Current Stats
    const currentStats = calculateStatsForRange(currentPeriodBookings, startDate, endDate);
    const previousStats = calculateStatsForRange(previousPeriodBookings, previousStartDate, previousEndDate);

    // 3. KPIs
    const totalRevenue = currentStats.revenue;
    const previousRevenue = previousStats.revenue;

    // Revenue Trend
    let revenueTrend = 0;
    if (previousRevenue > 0) {
        revenueTrend = ((totalRevenue - previousRevenue) / previousRevenue) * 100;
    } else if (totalRevenue > 0) {
        revenueTrend = 100;
    }

    // Occupancy Rate
    const { count: pitchesCount } = await supabase.from('pitches').select('*', { count: 'exact', head: true });
    const totalCapacity = (pitchesCount || 1) * currentStats.daysCount;
    const occupancyRate = (currentStats.occupiedDays / totalCapacity) * 100;

    // Avg Stay
    const rangeBookingsCount = currentPeriodBookings.length;
    const totalDuration = currentPeriodBookings.reduce((sum, b) => {
        const { start, end } = getBookingDates(b);
        return sum + differenceInCalendarDays(end, start);
    }, 0);
    const averageStay = rangeBookingsCount > 0 ? totalDuration / rangeBookingsCount : 0;

    // Charts Data
    const revenueByDate = Array.from(currentStats.daysMap.entries()).map(([date, data]) => ({
        date,
        value: Math.round(data.revenue * 100) / 100
    }));

    // Updated Occupancy Data structure with separate values
    const occupancyByDate = Array.from(currentStats.daysMap.entries()).map(([date, data]) => ({
        date,
        piazzola: data.occupiedPiazzola,
        tenda: data.occupiedTenda,
        total: data.occupiedPiazzola + data.occupiedTenda // Optional total if needed
    }));

    return {
        kpi: {
            revenue: Math.round(totalRevenue),
            occupancyRate: Math.round(occupancyRate),
            totalBookings: rangeBookingsCount,
            averageStay: Math.round(averageStay * 10) / 10,
            revenueTrend: Math.round(revenueTrend),
            occupancyTrend: 0, // Not requested but logic is similar
            bookingsTrend: 0
        },
        charts: {
            revenueByDate,
            occupancyByDate,
        }
    };
}

export async function fetchWeeklyOccupancy(startDate: Date, endDate: Date): Promise<StatsData['charts']['occupancyByDate']> {
    // 1. Calculate Range
    // Ensure we cover the full days (start 00:00 to end 23:59)
    const rangeStart = startOfDay(startDate);
    const rangeEnd = endOfDay(endDate);

    // 2. Fetch ONLY overlapping bookings
    // We use the PostgREST range operator 'cd' (contained by) or 'ov' (overlaps)
    // For DATERANGE '[start, end)', we want any booking that overlaps with our view window
    // formatted as [YYYY-MM-DD, YYYY-MM-DD)

    // Since supabase-js might be tricky with range syntax, we construct the range string
    const rangeStr = `[${format(rangeStart, 'yyyy-MM-dd')},${format(addDays(rangeEnd, 1), 'yyyy-MM-dd')})`;

    const { data: bookingsData, error } = await supabase
        .from('bookings')
        .select(`
            booking_period,
            pitch_id,
            pitch:pitches(type)
        `)
        .in('status', ['confirmed', 'checked_in'])
        .overlaps('booking_period', rangeStr);

    if (error) throw error;

    // 3. Process Data in Memory (similar to calculateStatsForRange but simplified)
    const daysMap = new Map<string, { piazzola: number; tenda: number }>();
    const days = eachDayOfInterval({ start: rangeStart, end: rangeEnd });

    // Init map
    days.forEach(day => {
        daysMap.set(format(day, 'yyyy-MM-dd'), { piazzola: 0, tenda: 0 });
    });

    // Helper to parse range
    const getDates = (period: string) => {
        const [s, e] = period.replace(/[\[\)]/g, '').split(',');
        return { start: parseISO(s), end: parseISO(e) };
    };

    bookingsData?.forEach((booking: any) => {
        const { start: bStart, end: bEnd } = getDates(booking.booking_period);
        const pitchType = booking.pitch?.type;

        let current = startOfDay(bStart);
        const limit = startOfDay(bEnd);

        while (current < limit) {
            if (current >= rangeStart && current <= rangeEnd) {
                const dayStr = format(current, 'yyyy-MM-dd');
                if (daysMap.has(dayStr)) {
                    const entry = daysMap.get(dayStr)!;
                    if (pitchType === 'piazzola') entry.piazzola++;
                    else if (pitchType === 'tenda') entry.tenda++;
                    // Update map - though entry is a ref, so object is mutated, but good practice
                }
            }
            current = addDays(current, 1);
        }
    });

    return Array.from(daysMap.entries()).map(([date, counts]) => ({
        date,
        piazzola: counts.piazzola,
        tenda: counts.tenda,
        total: counts.piazzola + counts.tenda
    }));
}
