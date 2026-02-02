import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { Booking, BookingWithDetails } from '@/lib/types';
import { eachDayOfInterval, format, parseISO, subDays, differenceInCalendarDays, startOfDay, endOfDay, addDays } from 'date-fns';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const startParam = searchParams.get('start'); // Expect ISO string or YYYY-MM-DD
        const endParam = searchParams.get('end');

        if (!startParam || !endParam) {
            return NextResponse.json(
                { error: 'start and end dates are required' },
                { status: 400 }
            );
        }

        const startDate = parseISO(startParam);
        const endDate = parseISO(endParam);

        // 0. Calculate Previous Period
        const durationInDays = differenceInCalendarDays(endDate, startDate) + 1;
        const previousEndDate = subDays(startDate, 1);
        const previousStartDate = subDays(previousEndDate, durationInDays - 1);

        // 1. Fetch Bookings overlapping the EXTENDED range
        // Since we are using supabaseAdmin, we can fetch all needed bookings without RLS issues
        // We fetching bookings that might overlap either current or previous period

        // Construct range string for query to filter at database level first
        // Range covers [previousStartDate, endDate]
        const queryStart = startOfDay(previousStartDate);
        const queryEnd = endOfDay(endDate);
        const rangeStr = `[${format(queryStart, 'yyyy-MM-dd')},${format(addDays(queryEnd, 1), 'yyyy-MM-dd')})`;

        const { data: bookingsData, error } = await supabaseAdmin
            .from('bookings')
            .select(`
                *,
                pitch:pitches(*),
                customer:customers(*)
            `)
            .in('status', ['confirmed', 'checked_in', 'checked_out'])
            .overlaps('booking_period', rangeStr);

        if (error) {
            console.error('[stats-analytics] Query error:', error);
            throw error;
        }

        const bookings = bookingsData as BookingWithDetails[];

        // Helper: Normalize booking dates
        const getBookingDates = (b: Booking) => {
            const [startStr, endStr] = b.booking_period.replace(/[\[\)]/g, '').split(',');
            return { start: parseISO(startStr), end: parseISO(endStr) };
        };

        // Helper: Filter bookings overlapping a specific range (in memory filter for precision)
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

        // Re-filter specifically for exact ranges
        const currentPeriodBookings = filterBookings(bookings, startDate, endDate);
        const previousPeriodBookings = filterBookings(bookings, previousStartDate, previousEndDate);

        // Helper: Calculate Revenue and Occupancy
        const calculateStatsForRange = (
            rangeBookings: BookingWithDetails[],
            inputStart: Date,
            inputEnd: Date
        ) => {
            let revenue = 0;
            let occupiedDays = 0;

            const rangeStart = startOfDay(inputStart);
            const rangeEnd = endOfDay(inputEnd);

            // Init map
            const daysMap = new Map<string, { revenue: number; occupiedPiazzola: number; occupiedTenda: number }>();
            const days = eachDayOfInterval({ start: rangeStart, end: rangeEnd });

            days.forEach(day => {
                daysMap.set(format(day, 'yyyy-MM-dd'), { revenue: 0, occupiedPiazzola: 0, occupiedTenda: 0 });
            });

            rangeBookings.forEach(booking => {
                const { start: bStart, end: bEnd } = getBookingDates(booking);
                const nights = differenceInCalendarDays(bEnd, bStart);
                const dailyRevenue = booking.total_price / Math.max(1, nights);
                // Handle pitch being array or object (Supabase join quirk)
                const pitchData = Array.isArray(booking.pitch) ? booking.pitch[0] : booking.pitch;
                const pitchType = pitchData?.type;

                let current = startOfDay(bStart);
                const limit = startOfDay(bEnd);

                while (current < limit) {
                    if (current >= rangeStart && current <= rangeEnd) {
                        const dayStr = format(current, 'yyyy-MM-dd');
                        if (daysMap.has(dayStr)) {
                            const entry = daysMap.get(dayStr)!;
                            entry.revenue += dailyRevenue;

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
            occupiedDays = Array.from(daysMap.values()).reduce((sum, d) => sum + d.occupiedPiazzola + d.occupiedTenda, 0);

            return { revenue, occupiedDays, daysMap, daysCount: days.length };
        };

        const currentStats = calculateStatsForRange(currentPeriodBookings, startDate, endDate);
        const previousStats = calculateStatsForRange(previousPeriodBookings, previousStartDate, previousEndDate);

        // KPIs
        const totalRevenue = currentStats.revenue;
        const previousRevenue = previousStats.revenue;

        let revenueTrend = 0;
        if (previousRevenue > 0) {
            revenueTrend = ((totalRevenue - previousRevenue) / previousRevenue) * 100;
        } else if (totalRevenue > 0) {
            revenueTrend = 100;
        }

        // Occupancy Rate
        // Get total pitches count
        const { count: pitchesCount } = await supabaseAdmin.from('pitches').select('*', { count: 'exact', head: true });
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

        const occupancyByDate = Array.from(currentStats.daysMap.entries()).map(([date, data]) => ({
            date,
            piazzola: data.occupiedPiazzola,
            tenda: data.occupiedTenda,
            total: data.occupiedPiazzola + data.occupiedTenda
        }));

        return NextResponse.json({
            kpi: {
                revenue: Math.round(totalRevenue),
                occupancyRate: Math.round(occupancyRate),
                totalBookings: rangeBookingsCount,
                averageStay: Math.round(averageStay * 10) / 10,
                revenueTrend: Math.round(revenueTrend),
                occupancyTrend: 0,
                bookingsTrend: 0
            },
            charts: {
                revenueByDate,
                occupancyByDate,
            }
        });

    } catch (error) {
        console.error('[stats-analytics] Internal error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
