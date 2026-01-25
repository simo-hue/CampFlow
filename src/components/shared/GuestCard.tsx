import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DashboardEvent } from '@/types/dashboard';
import { CalendarIcon, UserIcon, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { useState } from 'react';
import { CheckOutDialog } from './CheckOutDialog';

interface GuestCardProps {
    event: DashboardEvent;
    type: 'arrival' | 'departure';
    onRefresh?: () => void;
}

export function GuestCard({ event, type, onRefresh }: GuestCardProps) {
    const isArrival = type === 'arrival';
    const [showCheckOutDialog, setShowCheckOutDialog] = useState(false);

    // Theme configurations
    const theme = isArrival
        ? {
            icon: <ArrowDownCircle className="h-5 w-5 text-green-600" />,
            border: "border-l-4 border-l-green-500",
            button: "bg-green-600 hover:bg-green-700 text-white",
            badge: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
        }
        : {
            icon: <ArrowUpCircle className="h-5 w-5 text-blue-600" />,
            border: "border-l-4 border-l-blue-500",
            button: "bg-blue-600 hover:bg-blue-700 text-white",
            badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
        };

    const bookingDates = event.booking_period.match(/\[(.*?),(.*)\)/);
    const startDate = bookingDates ? new Date(bookingDates[1]) : null;
    const endDate = bookingDates ? new Date(bookingDates[2]) : null;

    const handleButtonClick = () => {
        if (isArrival) {
            // Check-in functionality (can be implemented later)
            console.log('Check-in clicked for:', event.id);
        } else {
            // Check-out functionality
            setShowCheckOutDialog(true);
        }
    };

    const handleCheckOutSuccess = () => {
        setShowCheckOutDialog(false);
        if (onRefresh) {
            onRefresh();
        }
    };

    return (
        <>
            <Card className={`p-4 transition-all hover:shadow-md ${theme.border}`}>
                <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">

                    {/* Left Section: Icon & Main Info */}
                    <div className="flex items-start md:items-center gap-4 overflow-hidden">
                        <div className="p-2 bg-muted rounded-full shrink-0">
                            {theme.icon}
                        </div>

                        <div className="min-w-0">
                            <h4 className="font-bold text-lg truncate flex items-center gap-2">
                                {event.customers.first_name} {event.customers.last_name}
                            </h4>

                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground mt-1">
                                <div className="flex items-center gap-1.5">
                                    <UserIcon className="h-3.5 w-3.5" />
                                    <span>{event.guests_count} ospiti</span>
                                </div>

                                {startDate && endDate && (
                                    <div className="flex items-center gap-1.5">
                                        <CalendarIcon className="h-3.5 w-3.5" />
                                        <span>
                                            {format(startDate, 'd MMM', { locale: it })}
                                            {' - '}
                                            {format(endDate, 'd MMM yyyy', { locale: it })}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Section: Pitch & Action */}
                    <div className="flex items-center gap-3 shrink-0 ml-12 md:ml-0">
                        <Badge variant="outline" className="px-3 py-1 text-base font-medium border-primary/20">
                            {event.pitches.number}
                        </Badge>

                        {(!isArrival && event.status === 'checked_out') ? (
                            <Badge variant="secondary" className="px-4 py-2 bg-green-100 text-green-700 hover:bg-green-100">
                                Completato
                            </Badge>
                        ) : (
                            <Button size="sm" className={`${theme.button} px-6`} onClick={handleButtonClick}>
                                {isArrival ? 'Check-in' : 'Check-out'}
                            </Button>
                        )}
                    </div>

                </div>
            </Card>

            {/* Check-out Dialog */}
            {!isArrival && (
                <CheckOutDialog
                    open={showCheckOutDialog}
                    onOpenChange={setShowCheckOutDialog}
                    event={event}
                    onSuccess={handleCheckOutSuccess}
                />
            )}
        </>
    );
}
