import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { DashboardEvent } from '@/types/dashboard';
import { Calendar, UserIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { useState } from 'react';
import { toast } from 'sonner';

interface CheckOutDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    event: DashboardEvent | null;
    onSuccess: () => void;
}

export function CheckOutDialog({ open, onOpenChange, event, onSuccess }: CheckOutDialogProps) {
    const [loading, setLoading] = useState(false);

    if (!event) return null;

    const bookingDates = event.booking_period.match(/\[(.*?),(.*)\)/);
    const startDate = bookingDates ? new Date(bookingDates[1]) : null;
    const endDate = bookingDates ? new Date(bookingDates[2]) : null;

    const handleConfirmCheckOut = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/bookings/${event.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status: 'checked_out'
                })
            });

            if (!response.ok) {
                throw new Error('Failed to update booking status');
            }

            toast.success('Check-out completato!', {
                description: `${event.customers.first_name} ${event.customers.last_name} ha lasciato la piazzola ${event.pitches.number}`
            });

            onOpenChange(false);
            onSuccess();
        } catch (error) {
            console.error('Check-out error:', error);
            toast.error('Errore durante il check-out', {
                description: 'Impossibile completare l\'operazione. Riprova.'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="text-2xl">Conferma Check-out</DialogTitle>
                    <DialogDescription className="text-base mt-2">
                        Confermi il check-out per questo ospite? La piazzola verrà liberata automaticamente.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Guest Info */}
                    <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg border">
                        <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">
                            {event.customers.first_name[0]}{event.customers.last_name[0]}
                        </div>
                        <div>
                            <h4 className="font-semibold text-lg">
                                {event.customers.first_name} {event.customers.last_name}
                            </h4>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <UserIcon className="h-3.5 w-3.5" />
                                <span>{event.guests_count} ospiti</span>
                            </div>
                        </div>
                    </div>

                    {/* Booking Details */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                            <p className="text-xs text-muted-foreground mb-1">Piazzola</p>
                            <p className="font-bold text-lg text-primary">{event.pitches.number}</p>
                        </div>
                        {startDate && endDate && (
                            <div className="p-3 bg-muted/30 rounded-lg border">
                                <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    Periodo
                                </p>
                                <p className="font-medium text-sm">
                                    {format(startDate, 'd MMM', { locale: it })} - {format(endDate, 'd MMM yyyy', { locale: it })}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Info Note */}
                    <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <p className="text-sm text-blue-900 dark:text-blue-300">
                            🔓 La piazzola sarà immediatamente disponibile per nuove prenotazioni
                        </p>
                    </div>
                </div>

                <DialogFooter className="gap-2">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={loading}
                    >
                        Annulla
                    </Button>
                    <Button
                        onClick={handleConfirmCheckOut}
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Conferma Check-out
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
