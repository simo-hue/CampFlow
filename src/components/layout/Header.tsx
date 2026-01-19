'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Calendar, Settings, Info, Tent, LayoutDashboard, UserCheck, BarChart3, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

// Actually, looking at layout.tsx, there's no ThemeToggle imported, but ThemeProvider exists. 
// I'll stick to the requested icons: Dashboard, Occupancy, Settings, Info.

const NAV_ITEMS = [
    // { label: 'Dashboard', href: '/', icon: LayoutDashboard },
    { label: 'Vista Occupazione', href: '/occupancy', icon: Calendar },
    { label: 'Check-in', href: '/checkin', icon: UserCheck },
    { label: 'Clienti', href: '/customers', icon: Users },
    { label: 'Statistiche', href: '/stats', icon: BarChart3 },
    { label: 'Impostazioni', href: '/settings', icon: Settings },
    { label: 'Info', href: '/info', icon: Info },
];

export function Header() {
    const pathname = usePathname();

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                {/* Logo / Brand */}
                <Link
                    href="/"
                    className="flex items-center gap-2 group transition-opacity hover:opacity-80"
                >
                    <div className="bg-primary/10 p-2 rounded-lg group-hover:bg-primary/20 transition-colors">
                        <Tent className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight">CampFlow</h1>
                        {/* Mobile hide subtitle */}
                        {/* <p className="text-[10px] text-muted-foreground hidden sm:block">Property Management</p> */}
                    </div>
                </Link>

                {/* Navigation */}
                <nav className="flex items-center gap-1 md:gap-2">
                    {NAV_ITEMS.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;

                        return (
                            <Link key={item.href} href={item.href}>
                                <Button
                                    variant={isActive ? "secondary" : "ghost"}
                                    size="sm"
                                    className={cn(
                                        "h-9 px-3 gap-2",
                                        isActive && "font-medium"
                                    )}
                                >
                                    <Icon className={cn("h-4 w-4", isActive ? "text-foreground" : "text-muted-foreground")} />
                                    <span className="hidden md:inline-block">{item.label}</span>
                                </Button>
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </header>
    );
}
