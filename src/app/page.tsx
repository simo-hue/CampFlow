import { QuickStatsWidget } from '@/components/dashboard/QuickStatsWidget';
import { GlobalSearchBar } from '@/components/dashboard/GlobalSearchBar';
import { AvailabilityModule } from '@/components/dashboard/AvailabilityModule';
import { TodayView } from '@/components/dashboard/TodayView';
import { Settings, Calendar, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">


      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="space-y-6">
          {/* Quick Stats */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Dashboard</h2>
            <QuickStatsWidget />
          </section>

          {/* Today View at Bottom */}
          <section>
            <TodayView />
          </section>

          {/* Availability Query */}
          <section>
            <AvailabilityModule />
          </section>
        </div>
      </main>
    </div>
  );
}
