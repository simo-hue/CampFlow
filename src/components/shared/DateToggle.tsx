import { Button } from '@/components/ui/button';

interface DateToggleProps {
    isToday: boolean;
    onToggle: (type: 'today' | 'tomorrow') => void;
}

export function DateToggle({ isToday, onToggle }: DateToggleProps) {
    return (
        <div className="flex items-center gap-2">
            <Button
                variant="outline"
                size="sm"
                onClick={() => onToggle('today')}
                className={isToday ? 'bg-primary/10 border-primary text-primary' : ''}
            >
                Oggi
            </Button>
            <Button
                variant="outline"
                size="sm"
                onClick={() => onToggle('tomorrow')}
                className={!isToday ? 'bg-primary/10 border-primary text-primary' : ''}
            >
                Domani
            </Button>
        </div>
    );
}
