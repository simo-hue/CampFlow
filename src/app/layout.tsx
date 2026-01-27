import './globals.css';
import Link from 'next/link';
import { Metadata } from 'next';
import { Tent, ArrowRight, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

export const metadata: Metadata = {
  title: {
    default: "CampFlow | Gestionale Campeggi Gratis Open Source",
    template: "%s | CampFlow"
  },
  description: "Il miglior software gestionale open source per campeggi, villaggi turistici e aree sosta. Prenotazioni, check-in veloce, schedine alloggiati e statistiche. Tutto gratis.",
  keywords: ["gestionale campeggio gratis", "software campeggio open source", "pms hotel open source", "gestione piazzole", "software villaggi turistici", "booking engine open source"],
  openGraph: {
    type: 'website',
    locale: 'it_IT',
    url: 'https://campflow.app',
    title: 'CampFlow | Il Gestionale per Campeggi Open Source',
    description: 'Gestisci il tuo campeggio con semplicità. Prenotazioni, mappa interattiva e check-in veloci. 100% Gratuito e Open Source.',
    siteName: 'CampFlow',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CampFlow | Gestionale Campeggi Open Source',
    description: 'Il futuro della gestione camping è Open Source. Provalo ora.',
  },
  authors: [{ name: "Simone Mattioli", url: "https://simo-hue.github.io" }],
  creator: "Simone Mattioli",
};

export default function WebsiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it" className="dark">
      <body className="antialiased min-h-screen bg-background text-foreground">
        <div className="flex min-h-screen flex-col">
          {/* Website Header */}
          <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2">
                <div className="bg-primary p-1.5 rounded-lg">
                  <Tent className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold tracking-tight">CampFlow</span>
              </Link>

              {/* Desktop Nav */}
              <nav className="hidden md:flex items-center gap-6">
                <Link href="/features" className="text-sm font-medium hover:text-primary transition-colors">
                  Funzionalità
                </Link>
                <Link href="/pricing" className="text-sm font-medium hover:text-primary transition-colors">
                  Prezzi
                </Link>
                <Link href="/faq" className="text-sm font-medium hover:text-primary transition-colors">
                  FAQ
                </Link>
                <a href="/contact" className="text-sm font-medium hover:text-primary transition-colors">
                  Contatti
                </a>
                <a href="https://github.com/simo-hue/CampFlow" target="_blank" rel="noopener noreferrer">
                  <Button size="sm">Vedi su GitHub <ArrowRight className="ml-2 w-4 h-4" /></Button>
                </a>
              </nav>

              {/* Mobile Nav */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right">
                  <div className="flex flex-col gap-4 mt-8">
                    <Link href="/features" className="text-lg font-medium">Funzionalità</Link>
                    <Link href="/pricing" className="text-lg font-medium">Prezzi</Link>
                    <Link href="/faq" className="text-lg font-medium">FAQ</Link>
                    <a href="mailto:mattioli.simone.10@gmail.com" className="text-lg font-medium">Contatti</a>
                    <div className="h-px bg-border my-2" />
                    <a href="https://github.com/simo-hue/CampFlow" target="_blank" rel="noopener noreferrer">
                      <Button className="w-full">Vedi su GitHub</Button>
                    </a>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1">
            {children}
          </main>

          {/* Footer */}
          <footer className="border-t py-8 bg-background">
            <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
              <p>© {new Date().getFullYear()} CampFlow. Open Source Project by <a href="https://simo-hue.github.io" target="_blank" rel="noopener noreferrer" className="hover:text-primary underline decoration-dotted underline-offset-4">Simone Mattioli</a>.</p>
              <div className="flex items-center gap-6">
                <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
                <Link href="/terms" className="hover:text-primary transition-colors">Termini & Condizioni</Link>
                <div className="h-4 w-px bg-border hidden md:block" />
                <a href="https://github.com/simo-hue" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">GitHub</a>
                <a href="https://www.linkedin.com/in/simonemattioli2003/" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">LinkedIn</a>
                <a href="https://simo-hue.github.io" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Portfolio</a>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
