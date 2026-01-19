import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Phone, Mail, MapPin, Clock, Info } from 'lucide-react';
import Link from 'next/link';

export default function InfoPage() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-3xl">
            <div className="mb-6">
                <Link href="/">
                    <Button variant="ghost" className="pl-0 gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        Torna alla Dashboard
                    </Button>
                </Link>
            </div>

            <Card className="border-t-4 border-t-primary shadow-lg">
                <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-primary/10 rounded-full">
                            <Info className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <CardTitle className="text-2xl">Informazioni Campeggio</CardTitle>
                            <CardDescription>Dati utili per operatori e reception</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-8">
                    {/* Contatti Rapidi */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4 p-4 bg-muted/30 rounded-lg border">
                            <h3 className="font-semibold flex items-center gap-2">
                                <Phone className="h-4 w-4" />
                                Telefoni Utili
                            </h3>
                            <div className="space-y-3 text-sm">
                                <div>
                                    <span className="text-muted-foreground block">Reception:</span>
                                    <span className="text-lg font-medium select-all">+39 0123 456789</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground block">Emergenze Notturne:</span>
                                    <span className="font-medium text-destructive select-all">+39 333 9998877</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground block">Manutenzione:</span>
                                    <span className="font-medium select-all">+39 333 1122334</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 p-4 bg-muted/30 rounded-lg border">
                            <h3 className="font-semibold flex items-center gap-2">
                                <Mail className="h-4 w-4" />
                                Email & Web
                            </h3>
                            <div className="space-y-3 text-sm">
                                <div>
                                    <span className="text-muted-foreground block">Email Principale:</span>
                                    <span className="font-medium select-all">info@campflow.it</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground block">Email Amministrazione:</span>
                                    <span className="font-medium select-all">admin@campflow.it</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground block">Sito Web:</span>
                                    <a href="#" className="text-primary hover:underline">www.campflow.it</a>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Orari e Indirizzo */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <h3 className="font-semibold flex items-center gap-2 mb-3">
                                <Clock className="h-4 w-4" />
                                Orari Reception
                            </h3>
                            <ul className="space-y-2 text-sm">
                                <li className="flex justify-between border-b pb-1">
                                    <span>Lunedì - Venerdì</span>
                                    <span className="font-medium">08:00 - 20:00</span>
                                </li>
                                <li className="flex justify-between border-b pb-1">
                                    <span>Sabato - Domenica</span>
                                    <span className="font-medium">08:00 - 22:00</span>
                                </li>
                                <li className="flex justify-between border-b pb-1 text-muted-foreground">
                                    <span>Pausa Pranzo</span>
                                    <span>13:00 - 15:00</span>
                                </li>
                            </ul>
                        </div>

                        <div className="space-y-2">
                            <h3 className="font-semibold flex items-center gap-2 mb-3">
                                <MapPin className="h-4 w-4" />
                                Indirizzo & Coordinate
                            </h3>
                            <div className="text-sm space-y-2">
                                <p className="font-medium">
                                    Via del Campeggio, 42<br />
                                    00100 Roma (RM)
                                </p>
                                <div className="mt-4 p-2 bg-muted rounded text-xs font-mono">
                                    LAT: 41.9027835<br />
                                    LON: 12.4963655
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Note Interne */}
                    <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900 rounded-lg">
                        <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">Note per lo Staff</h3>
                        <p className="text-sm text-yellow-700 dark:text-yellow-300">
                            • Ricordare di chiedere i documenti a TUTTI gli ospiti al check-in.<br />
                            • Il cancello chiude automaticamente alle 23:00.<br />
                            • Codice Wi-Fi attuale: <strong>CAMP2026!</strong>
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
