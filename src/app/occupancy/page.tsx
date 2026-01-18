import { SectorOccupancyViewer } from '@/components/dashboard/SectorOccupancyViewer';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function OccupancyPage() {
    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b bg-card sticky top-0 z-50">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center gap-4">
                        <Link href="/">
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Dashboard
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold">Vista Occupazione Settori</h1>
                            <p className="text-sm text-muted-foreground">Panoramica completa dell'occupazione per settore e periodo</p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-6">
                <SectorOccupancyViewer />
            </main>
        </div>
    );
}
