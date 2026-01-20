import { SectorOccupancyViewer } from '@/components/dashboard/SectorOccupancyViewer';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function OccupancyPage() {
    return (
        <div className="h-screen bg-background flex flex-col overflow-hidden">
            {/* Compact Header */}


            {/* Full-page Content - No container, no padding */}
            <main className="flex-1 overflow-hidden flex flex-col">
                <SectorOccupancyViewer />
            </main>
        </div>
    );
}
