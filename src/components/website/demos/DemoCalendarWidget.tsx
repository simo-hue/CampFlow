'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { User } from 'lucide-react';

export function DemoCalendarWidget() {
    const days = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];
    const pitches = ['101', '102', '103', '104', '105'];

    // Mock Bookings: [pitchIndex, dayStartIndex, duration, name, colorClass]
    const bookings = [
        { p: 0, d: 0, len: 3, name: 'Rossi', color: 'bg-rose-500' },
        { p: 0, d: 4, len: 2, name: 'Bianchi', color: 'bg-blue-500' },
        { p: 1, d: 2, len: 4, name: 'Verdi', color: 'bg-green-500' },
        { p: 2, d: 0, len: 7, name: 'Colombo', color: 'bg-purple-500' }, // Full week
        { p: 3, d: 5, len: 2, name: 'Ferrari', color: 'bg-orange-500' },
    ];

    const [hovered, setHovered] = useState<string | null>(null);

    return (
        <Card className="w-full overflow-hidden border shadow-sm">
            {/* Header */}
            <div className="grid grid-cols-8 border-b bg-muted/40 text-xs font-medium text-muted-foreground">
                <div className="p-2 border-r bg-background/50">Piazzola</div>
                {days.map(d => (
                    <div key={d} className="p-2 text-center border-r last:border-r-0">{d}</div>
                ))}
            </div>

            {/* Grid */}
            <div className="relative bg-background">
                {pitches.map((pitch, pIndex) => (
                    <div key={pitch} className="grid grid-cols-8 text-sm group hover:bg-muted/5 transition-colors">
                        {/* Pitch Label */}
                        <div className="p-2 font-bold border-r border-b bg-background sticky left-0 z-10 text-xs flex items-center justify-center">
                            {pitch}
                        </div>

                        {/* Days */}
                        {days.map((_, dIndex) => {
                            // Find booking starting here or covering this cell
                            // Logic simplified for visuals: we render absolute bars on top
                            return (
                                <div key={dIndex} className="border-r border-b h-10 relative">
                                    {/* Grid Lines */}
                                </div>
                            );
                        })}
                    </div>
                ))}

                {/* Absolute Booking Bars */}
                {bookings.map((b, i) => (
                    <div
                        key={i}
                        className={`absolute h-8 m-1 rounded-md shadow-sm border border-white/20 text-[10px] text-white font-medium flex items-center justify-center cursor-pointer transition-transform hover:scale-105 hover:z-20 ${b.color}`}
                        style={{
                            top: `${b.p * 40}px`, // 40px row height
                            left: `${(b.d + 1) * (100 / 8)}%`, // +1 for label col, 1/8 width approx
                            width: `${b.len * (100 / 8) - 1}%` // -1% gap
                        }}
                        onMouseEnter={() => setHovered(b.name)}
                        onMouseLeave={() => setHovered(null)}
                    >
                        <div className="flex items-center gap-1 truncate px-1">
                            <User className="w-3 h-3" />
                            <span className="truncate">{b.name}</span>
                        </div>

                        {/* Hover Tooltip Mock */}
                        {hovered === b.name && (
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-xs px-2 py-1 rounded shadow-lg border whitespace-nowrap z-50 animate-in fade-in zoom-in-95">
                                Check-out: 10:00
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </Card>
    );
}
