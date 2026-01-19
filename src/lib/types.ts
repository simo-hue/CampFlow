/**
 * TypeScript type definitions for CampFlow PMS
 */

export type PitchType = 'piazzola' | 'tenda';
export type PitchStatus = 'available' | 'maintenance' | 'blocked';
export type BookingStatus = 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled';
export type PitchSuffix = '' | 'a' | 'b';

export interface PitchAttributes {
    shade?: boolean;
    electricity?: boolean;
    water?: boolean;
    sewer?: boolean;
    size_sqm?: number;
    [key: string]: boolean | number | undefined;
}

// =====================================================
// SEASONAL PRICING TYPES
// =====================================================

export interface PricingSeason {
    id: string;
    name: string;
    description: string | null;
    start_date: string; // YYYY-MM-DD
    end_date: string;
    piazzola_price_per_day: number;
    tenda_price_per_day: number;
    priority: number; // Higher = wins in overlaps
    color: string; // Hex code for UI
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface PriceBreakdownDay {
    date: string;
    rate: number;
    seasonName: string;
    seasonColor: string;
}

export interface PriceCalculation {
    totalPrice: number;
    breakdown: PriceBreakdownDay[];
    days: number;
    averageRate: number;
}

export interface Pitch {
    id: string;
    number: string; // Base number e.g. "001"
    suffix: PitchSuffix; // '', 'a', or 'b'
    type: PitchType;
    attributes: PitchAttributes;
    status: PitchStatus;
    created_at: string;
    updated_at: string;
}

export interface Customer {
    id: string;
    first_name: string;
    last_name: string;
    email?: string;
    phone: string;
    address?: string;
    notes?: string;
    created_at: string;
    updated_at: string;
}

export interface Booking {
    id: string;
    pitch_id: string;
    customer_id: string;
    booking_period: string; // PostgreSQL tsrange as string: "[2026-01-01 00:00:00,2026-01-05 00:00:00)"
    guests_count: number;
    dogs_count: number;
    total_price: number;
    status: BookingStatus;
    notes?: string;
    created_at: string;
    updated_at: string;
}

// Extended types with relations
export interface BookingWithDetails extends Booking {
    pitch: Pitch;
    customer: Customer;
}

// API request/response types
export interface AvailabilityQuery {
    check_in: string; // YYYY-MM-DD
    check_out: string; // YYYY-MM-DD
    pitch_type?: PitchType;
}

export interface CreateBookingRequest {
    pitch_id: string;
    customer: {
        first_name: string;
        last_name: string;
        email?: string;
        phone: string;
        address?: string;
        notes?: string;
    };
    check_in: string; // YYYY-MM-DD
    check_out: string; // YYYY-MM-DD
    guests_count: number;
    dogs_count: number;
    notes?: string;
}

export interface DashboardStats {
    arrivals_today: number;
    departures_today: number;
    current_occupancy: number;
    occupancy_percentage: number;
    total_pitches: number;
}

export type GuestType = 'adult' | 'child' | 'infant';

export interface BookingGuest {
    id: string;
    booking_id: string;
    first_name: string;
    last_name: string;
    birth_date?: string; // YYYY-MM-DD
    birth_place?: string;
    address?: string;
    document_type?: string; // 'carta_identita' | 'passaporto' | 'patente'
    document_number?: string;
    nationality?: string;
    guest_type: GuestType;
    created_at: string;
    updated_at: string;
}

export interface CreateGuestRequest {
    booking_id: string;
    first_name: string;
    last_name: string;
    birth_date?: string;
    birth_place?: string;
    address?: string;
    document_type?: string;
    document_number?: string;
    nationality?: string;
    guest_type: GuestType;
}

// Pitch management types
export interface CreatePitchRequest {
    number: string;
    suffix?: PitchSuffix;
    type: PitchType;
    attributes?: PitchAttributes;
    create_double?: boolean; // If true, creates both 'a' and 'b' variants
}

export interface UpdatePitchRequest {
    type?: PitchType;
    attributes?: PitchAttributes;
    status?: PitchStatus;
}

export interface SplitPitchRequest {
    pitch_id: string; // ID of the single pitch to split
}

export interface MergePitchRequest {
    pitch_a_id: string;
    pitch_b_id: string;
}

// Helper function type for displaying pitch number
export type PitchDisplayNumber = (pitch: Pitch) => string; // Returns "001" or "001a"
