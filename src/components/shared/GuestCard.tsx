import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DashboardEvent } from '@/types/dashboard';

interface GuestCardProps {
    event: DashboardEvent;
    type: 'arrival' | 'departure';
}

export function GuestCard({ event, type }: GuestCardProps) {
    const isArrival = type === 'arrival';
    const badgeColor = isArrival
        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
        : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300';

    const buttonVariant = isArrival ? 'default' : 'secondary';
    const buttonClass = isArrival
        ? 'bg-green-600 hover:bg-green-700'
        : 'text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20';

    return (
        <div className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-accent/50 transition-colors shadow-sm">
            <div className="flex items-center gap-4">
                <div className={`${badgeColor} p-2.5 rounded-full`}>
                    <span className="font-bold text-lg">
                        {event.pitches.number}
                    </span>
                </div>
                <div>
                    <div className="font-semibold text-lg">
                        {event.customers.first_name} {event.customers.last_name}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-0.5">
                        <Badge variant="outline" className="font-normal">
                            {event.pitches.type === 'piazzola' ? 'Piazzola' : 'Tenda'}
                        </Badge>
                        <span>•</span>
                        <span>{event.guests_count} ospiti</span>
                    </div>
                </div>
            </div>

            <Button variant={buttonVariant} className={buttonClass}>
                {isArrival ? 'Check-in' : 'Check-out'}
            </Button>
        </div>
    );
}
