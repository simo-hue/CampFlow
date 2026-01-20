'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Grid, Calendar, RefreshCw, Zap, Home, Tent, ChevronLeft, ChevronRight, ChevronsRight, Plus } from 'lucide-react';
import { BookingCreationModal } from './BookingCreationModal';
import { BookingDetailsDialog } from './BookingDetailsDialog';
import { isDateInRange } from '@/lib/dateUtils';
import type { Pitch, PitchType } from '@/lib/types';
import { SECTORS } from '@/lib/pitchUtils';
import { addDays, subDays, format, startOfDay, parseISO, isSameDay } from 'date-fns';
import { it } from 'date-fns/locale';
import { toast } from "sonner";

interface DayOccupancy {
    date: string;
    isOccupied: boolean;
    bookingId?: string;
    bookingInfo?: {
        customer_name: string;
        guests_count: number;
    };
}

interface PitchWithDays {
    pitch: Pitch;
    days: DayOccupancy[];
}

const TIMEFRAMES = [
    { id: '3day', name: '3 Giorni', days: 3 },
    { id: 'weekly', name: 'Settimanale', days: 7 },
    { id: 'monthly', name: 'Mensile', days: 30 },
];

const PITCH_TYPES: { id: PitchType; name: string; icon: any }[] = [
    { id: 'piazzola', name: 'Piazzole', icon: Home },
    { id: 'tenda', name: 'Tende', icon: Tent },
];

const CACHE_WINDOW_DAYS = 45; // Increased to allow smoother navigation buffering
const CACHE_KEY_PREFIX = 'occupancy_cache_v2_';
const CACHE_VERSION_KEY = 'occupancy_cache_version';

function getCacheVersion(): string {
    if (typeof window === 'undefined') return '0';
    return localStorage.getItem(CACHE_VERSION_KEY) || '0';
}

export function invalidateOccupancyCache() {
    if (typeof window === 'undefined') return;
    const newVersion = (parseInt(getCacheVersion()) + 1).toString();
    localStorage.setItem(CACHE_VERSION_KEY, newVersion);
    console.log('🗑️ Occupancy cache invalidated - version:', newVersion);
}

function getCachedData(key: string): PitchWithDays[] | null {
    if (typeof window === 'undefined') return null;
    try {
        const item = localStorage.getItem(CACHE_KEY_PREFIX + key);
        if (!item) return null;

        const parsed = JSON.parse(item);
        if (parsed.version !== getCacheVersion()) {
            localStorage.removeItem(CACHE_KEY_PREFIX + key);
            return null;
        }

        console.log('📦 Cache HIT:', key);
        return parsed.data;
    } catch (error) {
        console.error('Error reading cache:', error);
        return null;
    }
}

function setCachedData(key: string, data: PitchWithDays[]) {
    if (typeof window === 'undefined') return;
    try {
        const cacheObject = {
            version: getCacheVersion(),
            timestamp: Date.now(),
            data,
        };
        localStorage.setItem(CACHE_KEY_PREFIX + key, JSON.stringify(cacheObject));
    } catch (error) {
        console.error('Error writing cache:', error);
    }
}

export function SectorOccupancyViewer() {
    const [selectedSector, setSelectedSector] = useState(SECTORS[0]);
    const [selectedTimeframe, setSelectedTimeframe] = useState(TIMEFRAMES[1]);
    const [selectedPitchType, setSelectedPitchType] = useState<PitchType>('piazzola');

    // View State
    const [viewStartDate, setViewStartDate] = useState<Date>(startOfDay(new Date()));

    // Cache & Data
    const [fullDataCache, setFullDataCache] = useState<PitchWithDays[]>([]);
    const [loading, setLoading] = useState(false);

    // Interaction State
    const [isDragging, setIsDragging] = useState(false);
    const [draftStart, setDraftStart] = useState<{ pitchId: string; date: string } | null>(null);
    const [selection, setSelection] = useState<{
        pitchId: string;
        pitchNumber: string;
        startDate: string;
        endDate: string;
    } | null>(null);
    const [showBookingModal, setShowBookingModal] = useState(false);

    // Details Popup State
    const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);

    // --- Navigation Handlers ---
    const handleNext = () => setViewStartDate(curr => addDays(curr, selectedTimeframe.days));
    const handlePrev = () => setViewStartDate(curr => subDays(curr, selectedTimeframe.days));
    const handleToday = () => setViewStartDate(startOfDay(new Date()));
    const handleDateSelect = (date: Date | undefined) => {
        if (date) setViewStartDate(startOfDay(date));
    };

    // Calculate dates
    const fullDateRange = useMemo(() => {
        // Cache window starts slightly before viewStartDate for smoother experience
        return Array.from({ length: CACHE_WINDOW_DAYS }, (_, i) => addDays(viewStartDate, i));
    }, [viewStartDate]);

    const displayDateRange = useMemo(() => {
        return Array.from({ length: selectedTimeframe.days }, (_, i) => addDays(viewStartDate, i));
    }, [selectedTimeframe, viewStartDate]);

    const cacheKey = useMemo(() => {
        const dateKey = format(fullDateRange[0], 'yyyy-MM-dd');
        const sectorPart = selectedPitchType === 'tenda' ? 'all' : selectedSector.id;
        return `${sectorPart}_${selectedPitchType}_${dateKey}`;
    }, [selectedSector, selectedPitchType, fullDateRange]);

    // Data Loading
    const loadSectorOccupancy = useCallback(async (forceRefresh: boolean = false) => {
        if (!forceRefresh && cacheKey) {
            const cached = getCachedData(cacheKey);
            if (cached) {
                setFullDataCache(cached);
                return;
            }
        }

        setLoading(true);
        try {
            const startDate = format(fullDateRange[0], 'yyyy-MM-dd');
            const endDate = format(addDays(fullDateRange[fullDateRange.length - 1], 1), 'yyyy-MM-dd');

            console.log(`⚡ Loading ${startDate} to ${endDate}`);

            const params: any = { date_from: startDate, date_to: endDate };
            if (selectedPitchType === 'piazzola') {
                params.sector_min = selectedSector.range.min.toString();
                params.sector_max = selectedSector.range.max.toString();
            }

            const response = await fetch('/api/occupancy/batch?' + new URLSearchParams(params));
            if (!response.ok) throw new Error('Failed to load occupancy data');

            const data = await response.json();
            const pitches: Pitch[] = data.pitches || [];
            const bookings = data.bookings || [];

            const filteredPitches = pitches.filter(p => p.type === selectedPitchType);

            const pitchesWithOccupancy: PitchWithDays[] = filteredPitches.map((pitch) => {
                const daysOccupancy = fullDateRange.map((date) => {
                    const dateStr = format(date, 'yyyy-MM-dd');
                    const booking = bookings.find((b: any) => {
                        if (b.pitch_id !== pitch.id) return false;
                        const checkIn = parseISO(b.check_in);
                        // Fix: Check-out day is free for next arrival, so strictly less than
                        const checkOut = parseISO(b.check_out);
                        const currentDate = parseISO(dateStr);
                        return currentDate >= checkIn && currentDate < checkOut;
                    });

                    return {
                        date: dateStr,
                        isOccupied: !!booking,
                        bookingId: booking?.id,
                        bookingInfo: booking ? {
                            customer_name: booking.customer_name || 'Occupato',
                            guests_count: booking.guests_count || 0,
                        } : undefined,
                    };
                });
                return { pitch, days: daysOccupancy };
            });

            setFullDataCache(pitchesWithOccupancy);
            setCachedData(cacheKey, pitchesWithOccupancy);
        } catch (error) {
            console.error('Error loading occupancy:', error);
            toast.error("Errore caricamento dati");
        } finally {
            setLoading(false);
        }
    }, [selectedSector, selectedPitchType, fullDateRange, cacheKey]);

    useEffect(() => {
        loadSectorOccupancy(false);
    }, [loadSectorOccupancy]);

    // Derived Display Data
    const displayedData = useMemo(() => {
        if (fullDataCache.length === 0) return [];
        return fullDataCache.map(item => ({
            pitch: item.pitch,
            days: item.days.slice(0, selectedTimeframe.days)
        }));
    }, [fullDataCache, selectedTimeframe]);


    // Keyboard support - ESC to cancel selection
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                if (isDragging || draftStart || selection) {
                    console.log("🚫 Escape pressed - Cancelling selection");
                    setIsDragging(false);
                    setDraftStart(null);
                    setSelection(null);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isDragging, draftStart, selection]);

    // --- Interaction Logic (Drag + Click-Click) ---

    // 1. Mouse Down: Start Drag or Prepare Click (OR OPEN DETAILS if occupied)
    const handleCellMouseDown = (pitch: Pitch, date: string, isOccupied: boolean, bookingId?: string) => {
        if (isOccupied) {
            if (bookingId) {
                console.log("Opening details for booking:", bookingId);
                setSelectedBookingId(bookingId);
                setShowDetailsModal(true);
            }
            return;
        }

        setIsDragging(true);

        // If we are continuing a draft (click-click) on same pitch, don't reset yet
        if (draftStart && draftStart.pitchId === pitch.id) {
            // Previewing the end of split selection
        } else {
            // Start fresh drag/click
            setDraftStart(null); // Clear previous draft if different pitch
            setSelection({
                pitchId: pitch.id,
                pitchNumber: pitch.number,
                startDate: date,
                endDate: date,
            });
        }
    };

    // 2. Mouse Enter: Update Drag Selection
    const handleCellMouseEnter = (pitch: Pitch, date: string, isOccupied: boolean) => {
        if (isOccupied) return;

        // Visual feedback for Dragging
        if (isDragging && selection && selection.pitchId === pitch.id) {
            setSelection(prev => prev ? { ...prev, endDate: date } : null);
            return;
        }

        // Visual feedback for Click-Click Draft
        if (!isDragging && draftStart && draftStart.pitchId === pitch.id) {
            setSelection({
                pitchId: pitch.id,
                pitchNumber: pitch.number,
                startDate: draftStart.date,
                endDate: date
            });
        }
    };

    // Helper: Check for overlaps in full data
    const checkOverlap = (pitchId: string, startDate: string, endDate: string) => {
        const pitchData = fullDataCache.find(p => p.pitch.id === pitchId);
        if (!pitchData) return false; // Fail safe

        const start = new Date(startDate);
        const end = new Date(endDate);

        // Iterate through days in range
        for (let d = start; d < end; d = addDays(d, 1)) {
            const dateStr = format(d, 'yyyy-MM-dd');
            const dayInfo = pitchData.days.find(day => day.date === dateStr);

            // Note: If day is not in cache (navigated away), we might miss it.
            // But for standard usage, cache covers 45 days.
            if (dayInfo && dayInfo.isOccupied) {
                return true;
            }
        }
        return false;
    };

    // 3. Mouse Up: Commit or Set Draft
    const handleMouseUp = (pitch: Pitch, date: string) => {
        if (!isDragging && !draftStart) return;

        // Always stop dragging
        setIsDragging(false);

        // Analysis: Was it a Drag or a Click?
        // If selection start != end, it was a drag -> Commit
        if (selection && selection.startDate !== selection.endDate) {
            console.log("✅ Drag Commit");

            // Normalize Date Range: Ensure start is always before end
            let finalStart = selection.startDate;
            let finalEnd = selection.endDate;

            if (selection.startDate > selection.endDate) {
                finalStart = selection.endDate;
                finalEnd = selection.startDate;
                setSelection(prev => prev ? {
                    ...prev,
                    startDate: finalStart,
                    endDate: finalEnd
                } : null);
            }

            // VALIDATION: Check for overlapping bookings (Drag)
            const hasOverlap = checkOverlap(pitch.id, finalStart, finalEnd);
            if (hasOverlap) {
                toast.error("Selezione non valida", {
                    description: "La selezione include giorni già occupati. Scegli un periodo libero."
                });
                setDraftStart(null);
                setSelection(null);
                return;
            }

            setShowBookingModal(true);
            setDraftStart(null);
            return;
        }

        // It was a single click (Start == End)
        // If we have a draftStart on this pitch...
        if (draftStart && draftStart.pitchId === pitch.id) {
            // ... and we clicked a different date (via navigation)? 
            // Logic: If I click start, then navigate, then click end, selection is range.
            // If I click start, then click start again -> Reset?
            if (draftStart.date === date) {
                // Clicked same cell twice -> maybe cancel or just keep it?
                // Let's keep it selected (Drafting)
            } else {
                // Clicked different cell -> Commit Click-Click

                // VALIDATION: Check if end date is before start date
                if (date < draftStart.date) {
                    toast.warning("Selezione non valida", {
                        description: "La data di partenza deve essere successiva alla data di arrivo. Riprova."
                    });
                    setDraftStart(null);
                    setSelection(null);
                    return;
                }

                // VALIDATION: Check for overlapping bookings
                // Iterate from start to end and check fullDataCache
                const hasOverlap = checkOverlap(pitch.id, draftStart.date, date);
                if (hasOverlap) {
                    toast.error("Selezione non valida", {
                        description: "La selezione include giorni già occupati. Scegli un periodo libero."
                    });
                    setDraftStart(null);
                    setSelection(null);
                    return;
                }

                console.log("✅ Click-Click Commit");
                // Ensure selection is updated to range
                setSelection({
                    pitchId: pitch.id,
                    pitchNumber: pitch.number,
                    startDate: draftStart.date,
                    endDate: date
                });
                setShowBookingModal(true);
                setDraftStart(null);
            }
        } else {
            // First click -> Start Draft
            console.log("✏️ Draft Start");
            setDraftStart({ pitchId: pitch.id, date: date });
            setSelection({
                pitchId: pitch.id,
                pitchNumber: pitch.number,
                startDate: date,
                endDate: date
            });
        }
    };

    // Global Mouse Up to cancel drag if outside
    useEffect(() => {
        const handleGlobalMouseUp = () => {
            if (isDragging) {
                setIsDragging(false);
                // If we were effectively dragging (range selected), commit?
                // Better: if released outside, cancel drag but keep selection?
                // Let's just cancel drag state.
            }
        };
        document.addEventListener('mouseup', handleGlobalMouseUp);
        return () => document.removeEventListener('mouseup', handleGlobalMouseUp);
    }, [isDragging]);

    const handleBookingSuccess = () => {
        loadSectorOccupancy(true);
        setDraftStart(null);
        setSelection(null);
    };

    // --- Render Helpers ---

    const isCellSelected = (pitchId: string, date: string): boolean => {
        if (!selection || selection.pitchId !== pitchId) return false;
        return isDateInRange(date, selection.startDate, selection.endDate);
    };

    const getCellClassName = (pitch: Pitch, date: string, isOccupied: boolean): string => {
        const selected = isCellSelected(pitch.id, date);
        const isDraft = draftStart?.pitchId === pitch.id && draftStart.date === date;

        // Base background for free cells (lighter hover)
        // For occupied cells, we rely on the inner "pill" for the main color, 
        // but keep a subtle tint on the cell itself just in case.
        const baseColor = isOccupied
            ? '' // Unused effectively because content covers it, but kept for fallback
            : 'hover:bg-muted/50 transition-colors duration-200';

        // Reverting to previous logic but cleaner
        if (selected) return 'p-0 border-r border-b relative bg-blue-500/20';
        if (isDraft) return 'p-0 border-r border-b relative bg-blue-500/40 animate-pulse';

        return `p-0 border-r border-b relative h-[50px] ${isOccupied ? '' : baseColor}`;
    };

    return (
        <div className="h-full flex flex-col bg-background">
            {/* Top Bar */}
            <div className="bg-card border-b px-4 py-3 shadow-sm space-y-3">

                {/* Row 1: Filters */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                    {/* Pitch Type & Sector */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                        <div className="flex gap-1 border-r pr-2 mr-2">
                            {PITCH_TYPES.map(type => (
                                <Button
                                    key={type.id}
                                    variant={selectedPitchType === type.id ? 'default' : 'ghost'}
                                    size="sm"
                                    onClick={() => setSelectedPitchType(type.id)}
                                >
                                    <type.icon className="w-4 h-4 mr-1" />
                                    {type.name}
                                </Button>
                            ))}
                        </div>

                        {selectedPitchType === 'piazzola' && (
                            <div className="flex gap-1">
                                {SECTORS.map(sector => (
                                    <Button
                                        key={sector.id}
                                        variant={selectedSector.id === sector.id ? 'secondary' : 'ghost'}
                                        size="sm"
                                        className="text-xs"
                                        onClick={() => setSelectedSector(sector)}
                                    >
                                        {sector.name}
                                    </Button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Timeframe */}
                    <div className="flex bg-muted rounded-lg p-1">
                        {TIMEFRAMES.map(tf => (
                            <button
                                key={tf.id}
                                onClick={() => setSelectedTimeframe(tf)}
                                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${selectedTimeframe.id === tf.id ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                {tf.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Row 2: Navigation & Status */}
                <div className="flex items-center justify-between">
                    {/* Date Navigation */}
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" onClick={handlePrev} title="Periodo Precedente">
                            <ChevronLeft className="h-4 w-4" />
                        </Button>

                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="min-w-[140px] font-mono">
                                    <Calendar className="mr-2 h-4 w-4" />
                                    {format(viewStartDate, 'd MMM yyyy', { locale: it })}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <CalendarComponent
                                    mode="single"
                                    selected={viewStartDate}
                                    onSelect={handleDateSelect}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>

                        <Button variant="outline" size="icon" onClick={handleNext} title="Periodo Successivo">
                            <ChevronRight className="h-4 w-4" />
                        </Button>

                        <Button variant="ghost" size="sm" onClick={handleToday}>
                            Oggi
                        </Button>
                    </div>

                    {/* Interaction Hint */}
                    <div className="text-xs text-muted-foreground hidden md:flex items-center gap-2">
                        {draftStart ? (
                            <span className="flex items-center text-blue-600 font-bold animate-pulse">
                                <ChevronsRight className="w-4 h-4 mr-1" />
                                Seleziona data di partenza
                            </span>
                        ) : (
                            <span>Click o Trascina per prenotare</span>
                        )}
                        <div className="h-4 w-px bg-border mx-2" />
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => loadSectorOccupancy(true)}
                            disabled={loading}
                        >
                            <RefreshCw className={`h-3 w-3 mr-1 ${loading ? 'animate-spin' : ''}`} />
                            Aggiorna
                        </Button>
                    </div>
                </div>
            </div>

            {/* Matrix */}
            <div className="flex-1 overflow-auto bg-muted/5">
                {loading && displayedData.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="flex flex-col items-center gap-3">
                            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                            <p className="text-sm text-muted-foreground">Caricamento disponibilità...</p>
                        </div>
                    </div>
                ) : (
                    <table className="w-full text-sm border-collapse">
                        <thead className="shadow-sm">
                            <tr>
                                <th className="p-3 text-left border-b font-medium min-w-[100px] w-[100px] bg-card sticky top-0 left-0 z-50 border-r shadow-[0_1px_2px_rgba(0,0,0,0.1)]">
                                    {selectedPitchType === 'piazzola' ? 'Piazzola' : 'Tenda'}
                                </th>
                                {displayDateRange.map(date => {
                                    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                                    const isToday = isSameDay(date, new Date());

                                    return (
                                        <th key={date.toISOString()} className="p-0 border-b border-r min-w-[60px] text-center sticky top-0 z-30 bg-card">
                                            <div className={`p-2 flex flex-col items-center justify-center h-full w-full ${isWeekend ? 'bg-muted/30' : ''} ${isToday ? 'bg-blue-50/50' : ''}`}>
                                                <span className="text-[10px] uppercase text-muted-foreground font-semibold">
                                                    {format(date, 'EEE', { locale: it })}
                                                </span>
                                                <span className={`text-sm font-bold ${isToday ? 'text-blue-600' : ''}`}>
                                                    {format(date, 'dd')}
                                                </span>
                                                {selectedTimeframe.days < 10 && (
                                                    <span className="text-[10px] text-muted-foreground">
                                                        {format(date, 'MMM', { locale: it })}
                                                    </span>
                                                )}
                                            </div>
                                        </th>
                                    );
                                })}
                            </tr>
                        </thead>
                        <tbody>
                            {displayedData.map(item => (
                                <tr key={item.pitch.id} className="group bg-card hover:bg-muted/10 transition-colors">
                                    <td className="p-3 font-bold text-center border-b border-r bg-card sticky left-0 z-20 group-hover:bg-muted/10">
                                        {item.pitch.number}
                                    </td>
                                    {item.days.map(day => (
                                        <td
                                            key={day.date}
                                            className={getCellClassName(item.pitch, day.date, day.isOccupied)}
                                            onMouseDown={() => handleCellMouseDown(item.pitch, day.date, day.isOccupied, day.bookingId)}
                                            onMouseEnter={() => handleCellMouseEnter(item.pitch, day.date, day.isOccupied)}
                                            onMouseUp={() => handleMouseUp(item.pitch, day.date)}
                                        >
                                            {/* SELECTION OVERLAY */}
                                            {isCellSelected(item.pitch.id, day.date) && (
                                                <div className="absolute inset-0 bg-blue-600/20 z-10 pointer-events-none border-2 border-blue-500" />
                                            )}

                                            {/* BOOKING PILL */}
                                            {day.isOccupied ? (
                                                <div className="absolute inset-x-[1px] inset-y-[1px] rounded-md bg-gradient-to-br from-rose-500 to-rose-600 dark:from-rose-600 dark:to-rose-700 shadow-sm border border-rose-400/50 flex items-center justify-center overflow-hidden hover:brightness-110 transition-all cursor-pointer group-hover:shadow-md z-0">
                                                    {selectedTimeframe.days < 10 && (
                                                        <div className="flex flex-col items-center justify-center w-full px-1">
                                                            <span className="text-[10px] font-bold text-white drop-shadow-sm truncate w-full text-center leading-tight">
                                                                {day.bookingInfo?.customer_name}
                                                            </span>
                                                            <span className="text-[9px] text-rose-100/90 hidden sm:block">
                                                                {day.bookingInfo?.guests_count} Ospiti
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                // FREE CELL CONTENT (Optional: dots or empty)
                                                <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 pointer-events-none">
                                                    <Plus className="w-4 h-4 text-muted-foreground/50" />
                                                </div>
                                            )}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Existing Modal - Unchanged interface */}
            {selection && showBookingModal && (
                <BookingCreationModal
                    open={showBookingModal}
                    onClose={() => {
                        setShowBookingModal(false);
                        setSelection(null);
                        setDraftStart(null);
                    }}
                    pitchNumber={selection.pitchNumber}
                    pitchId={selection.pitchId}
                    pitchType={selectedPitchType}
                    checkIn={selection.startDate}
                    checkOut={selection.endDate}
                    onSuccess={handleBookingSuccess}
                />
            )}

            {/* Booking Details Dialog */}
            <BookingDetailsDialog
                open={showDetailsModal}
                onClose={() => setShowDetailsModal(false)}
                bookingId={selectedBookingId}
            />
        </div>
    );
}
