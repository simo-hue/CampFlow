export interface DashboardEvent {
    id: string;
    pitch_id: string;
    guests_count: number;
    pitches: {
        number: string;
        type: string;
    };
    customers: {
        first_name: string;
        last_name: string;
    };
}

export interface DashboardData {
    date: string;
    arrivals: DashboardEvent[];
    departures: DashboardEvent[];
    total_arrivals: number;
    total_departures: number;
}
