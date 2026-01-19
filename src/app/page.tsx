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
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">CampFlow</h1>
              <p className="text-sm text-muted-foreground">Property Management System</p>
            </div>
            <div className="flex items-center gap-2">
              <GlobalSearchBar />
              <Link href="/occupancy">
                <Button variant="ghost" size="icon" title="Vista Occupazione">
                  <Calendar className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/settings">
                <Button variant="ghost" size="icon" title="Impostazioni">
                  <Settings className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/info">
                <Button variant="ghost" size="icon" title="Informazioni Campeggio">
                  <Info className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

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
