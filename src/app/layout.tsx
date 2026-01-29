import './globals.css';
import Link from 'next/link';
import { Metadata } from 'next';
import { Tent, ArrowRight, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

export const metadata: Metadata = {
  metadataBase: new URL("https://simo-hue.github.io/CampFlow"),
  title: {
    default: "CampFlow | Free Open Source Camping Management Software",
    template: "%s | CampFlow"
  },
  description: "The best open source management software for campsites, holiday villages and rest areas. Reservations, fast check-in, guest reporting and statistics. All free.",
  keywords: ["free camping management software", "open source camping software", "open source hotel pms", "pitch management", "holiday village software", "open source booking engine"],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simo-hue.github.io/CampFlow',
    title: 'CampFlow | The Open Source Camping Management Software',
    description: 'Manage your campsite with simplicity. Reservations, interactive map and fast check-ins. 100% Free and Open Source.',
    siteName: 'CampFlow',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CampFlow | Open Source Camping Management Software',
    description: 'The future of camping management is Open Source. Try it now.',
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
    <html lang="en" className="dark">
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
                  Features
                </Link>
                <Link href="/pricing" className="text-sm font-medium hover:text-primary transition-colors">
                  Pricing
                </Link>
                <Link href="/faq" className="text-sm font-medium hover:text-primary transition-colors">
                  FAQ
                </Link>
                <Link href="/contact" className="text-sm font-medium hover:text-primary transition-colors">
                  Contact
                </Link>
                <a href="https://github.com/simo-hue/CampFlow" target="_blank" rel="noopener noreferrer">
                  <Button size="sm">View on GitHub <ArrowRight className="ml-2 w-4 h-4" /></Button>
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
                    <Link href="/features" className="text-lg font-medium">Features</Link>
                    <Link href="/pricing" className="text-lg font-medium">Pricing</Link>
                    <Link href="/faq" className="text-lg font-medium">FAQ</Link>
                    <Link href="/contact" className="text-lg font-medium">Contact</Link>
                    <div className="h-px bg-border my-2" />
                    <a href="https://github.com/simo-hue/CampFlow" target="_blank" rel="noopener noreferrer">
                      <Button className="w-full">View on GitHub</Button>
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
                <Link href="/terms" className="hover:text-primary transition-colors">Terms & Conditions</Link>
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
