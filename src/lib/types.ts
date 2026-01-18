/**
 * TypeScript type definitions for CampFlow PMS
 */

export type PitchType = 'standard' | 'comfort' | 'premium';
export type PitchStatus = 'available' | 'maintenance' | 'blocked';
export type BookingStatus = 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled';

export interface PitchAttributes {
    shade?: boolean;
    electricity?: boolean;
    water?: boolean;
    sewer?: boolean;
    size_sqm?: number;
}

export interface Pitch {
    id: string;
    number: string;
    type: PitchType;
    attributes: PitchAttributes;
    status: PitchStatus;
    created_at: string;
    updated_at: string;
}

export interface Customer {
    id: string;
    full_name: string;
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
        full_name: string;
        email?: string;
        phone: string;
        address?: string;
        notes?: string;
    };
    check_in: string; // YYYY-MM-DD
    check_out: string; // YYYY-MM-DD
    guests_count: number;
    notes?: string;
}

export interface DashboardStats {
    arrivals_today: number;
    departures_today: number;
    current_occupancy: number;
    occupancy_percentage: number;
}
