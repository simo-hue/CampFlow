import Link from 'next/link';
import { Tent, ArrowRight, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

export default function WebsiteLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen flex-col bg-background text-foreground">
            {/* Website Header */}
            <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href="/w" className="flex items-center gap-2">
                        <div className="bg-primary p-1.5 rounded-lg">
                            <Tent className="h-5 w-5 text-primary-foreground" />
                        </div>
                        <span className="text-xl font-bold tracking-tight">CampFlow</span>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-6">
                        <Link href="/w/features" className="text-sm font-medium hover:text-primary transition-colors">
                            Funzionalità
                        </Link>
                        <Link href="/w/pricing" className="text-sm font-medium hover:text-primary transition-colors">
                            Prezzi
                        </Link>
                        <Link href="/w/faq" className="text-sm font-medium hover:text-primary transition-colors">
                            FAQ
                        </Link>
                        <Link href="/w/contact" className="text-sm font-medium hover:text-primary transition-colors">
                            Contatti
                        </Link>
                        <Link href="/w/contact">
                            <Button size="sm">Inizia Ora <ArrowRight className="ml-2 w-4 h-4" /></Button>
                        </Link>
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
                                <Link href="/w/features" className="text-lg font-medium">Funzionalità</Link>
                                <Link href="/w/pricing" className="text-lg font-medium">Prezzi</Link>
                                <Link href="/w/faq" className="text-lg font-medium">FAQ</Link>
                                <Link href="/w/contact" className="text-lg font-medium">Contatti</Link>
                                <div className="h-px bg-border my-2" />
                                <Link href="/w/contact">
                                    <Button className="w-full">Inizia Ora</Button>
                                </Link>
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
                    <p>© {new Date().getFullYear()} CampFlow. Open Source Project.</p>
                    <div className="flex items-center gap-6">
                        <Link href="/w/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
                        <Link href="/w/terms" className="hover:text-primary transition-colors">Termini & Condizioni</Link>
                        <div className="h-4 w-px bg-border hidden md:block" />
                        <a href="https://github.com/simo-hue" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">GitHub</a>
                        <a href="https://www.linkedin.com/in/simonemattioli2003/" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">LinkedIn</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
