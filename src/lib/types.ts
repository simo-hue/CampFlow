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
// CUSTOMER GROUPS TYPES
// =====================================================

export interface CustomRates {
    // Overrides for standard season rates
    piazzola?: number;
    tenda?: number;
    person?: number;
    child?: number;
    dog?: number;
    car?: number;
}

export interface GroupSeasonConfiguration {
    id: string;
    group_id: string;
    season_id: string;
    discount_percentage?: number; // e.g. 10.00 for 10%
    custom_rates?: CustomRates; // JSONB
    enable_bundle?: boolean; // New flag: if true, check for bundles
    created_at: string;
    updated_at: string;
}

export interface GroupBundle {
    id: string;
    group_id: string;
    season_id?: string; // Optional during transition, but logically required for new logic
    nights: number;
    pitch_price: number;
    unit_prices: Record<string, number>; // e.g. { "person": 10, "dog": 5 }
    created_at: string;
    updated_at: string;
}

export interface CustomerGroup {
    id: string;
    name: string;
    description?: string;
    color: string;
    season_configurations?: GroupSeasonConfiguration[]; // For frontend convenience
    bundles?: GroupBundle[]; // For frontend convenience
    created_at: string;
    updated_at: string;
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
    person_price_per_day: number;
    child_price_per_day: number;
    dog_price_per_day: number;
    car_price_per_day: number;
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
    sector_id?: string; // Optional manual override
    created_at: string;
    updated_at: string;
}

export interface Customer {
    id: string;
    first_name: string;
    last_name: string;
    email?: string;
    phone: string;
    address?: string; // Via/Piazza + Civico
    notes?: string;
    personal_id_code?: string; // Codice Fiscale

    // Birth Details
    birth_date?: string;
    birth_country?: string;
    birth_city?: string;
    birth_province?: string;
    citizenship?: string;
    gender?: 'M' | 'F' | 'Other';
    license_plate?: string;

    // Residence Details
    residence_country?: string;
    residence_province?: string;
    residence_city?: string;
    residence_zip?: string;

    // Document Details
    document_type?: string;
    document_number?: string;
    document_issue_country?: string;
    document_issue_city?: string;
    document_issue_date?: string;
    document_issuer?: string; // Ente

    group_id?: string; // Link to CustomerGroup
    group?: CustomerGroup; // Joined data

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

export interface CreateCustomerRequest {
    first_name: string;
    last_name: string;
    email?: string;
    phone: string;
    address?: string;
    notes?: string;

    // Detailed info for check-in
    birth_date?: string;
    birth_country?: string;
    birth_city?: string;
    birth_province?: string;
    citizenship?: string;
    gender?: 'M' | 'F' | 'Other';
    license_plate?: string;
    residence_country?: string;
    residence_province?: string;
    residence_city?: string;
    residence_zip?: string;
    document_type?: string;
    document_number?: string;
    document_issue_country?: string; // missing in previous
    document_issue_city?: string;
    document_issue_date?: string;
    document_issuer?: string;
    group_id?: string; // Optional group assignment
}

export interface CreateBookingRequest {
    pitch_id: string;
    customer_id?: string; // Optional: if selecting existing customer
    customer: CreateCustomerRequest;

    check_in: string; // YYYY-MM-DD
    check_out: string; // YYYY-MM-DD

    guests_count: number;
    guest_names?: string[]; // Optional: names collected at booking
    children_count?: number; // Added for seasonal pricing
    dogs_count?: number;    // Optional: number of dogs
    cars_count?: number;    // Added for seasonal pricing

    notes?: string | null;
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
    sector_id?: string;
}

export interface UpdatePitchRequest {
    type?: PitchType;
    attributes?: PitchAttributes;
    status?: PitchStatus;
    sector_id?: string;
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
