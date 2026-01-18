import { SectorOccupancyViewer } from '@/components/dashboard/SectorOccupancyViewer';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function OccupancyPage() {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Compact Header */}
            <header className="border-b bg-card sticky top-0 z-50 shadow-sm">
                <div className="container mx-auto px-6 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link href="/">
                                <Button variant="ghost" size="sm">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Dashboard
                                </Button>
                            </Link>
                            <div className="h-6 w-px bg-border" />
                            <div>
                                <h1 className="text-xl font-bold">Vista Occupazione Settori</h1>
                                <p className="text-xs text-muted-foreground">Panoramica completa dell'occupazione per settore e periodo</p>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Full-page Content - No container, no padding */}
            <main className="flex-1 overflow-hidden">
                <SectorOccupancyViewer />
            </main>
        </div>
    );
}
