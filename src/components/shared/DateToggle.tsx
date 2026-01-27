import { Button } from '@/components/ui/button';

interface DateToggleProps {
    currentView: 'today' | 'tomorrow' | 'week';
    onToggle: (view: 'today' | 'tomorrow' | 'week') => void;
}

export function DateToggle({ currentView, onToggle }: DateToggleProps) {
    return (
        <div className="flex items-center gap-2 p-1 bg-muted rounded-lg border">
            <Button
                variant={currentView === 'today' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onToggle('today')}
                className="h-8 transition-all"
            >
                Oggi
            </Button>
            <Button
                variant={currentView === 'tomorrow' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onToggle('tomorrow')}
                className="h-8 transition-all"
            >
                Domani
            </Button>
            <Button
                variant={currentView === 'week' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onToggle('week')}
                className="h-8 transition-all"
            >
                Settimana
            </Button>
        </div>
    );
}
