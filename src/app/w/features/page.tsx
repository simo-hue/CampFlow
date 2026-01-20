import {
    LayoutDashboard,
    Calendar,
    Users,
    UserCheck,
    BarChart3,
    ShieldCheck,
    Zap,
    Search,
    FileText,
    Smartphone,
    Database,
    Globe,
    CheckCircle2
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { DemoStatsWidget } from '@/components/website/demos/DemoStatsWidget';
import { DemoCheckInWidget } from '@/components/website/demos/DemoCheckInWidget';
import { DemoCalendarWidget } from '@/components/website/demos/DemoCalendarWidget';
import { DemoSystemWidget } from '@/components/website/demos/DemoSystemWidget';

import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Funzionalità | Gestionale Campeggio con Mappa Interattiva",
    description: "Scopri le funzioni di CampFlow: Planning visivo, Check-in veloce, Schedine Alloggiati, Statistiche e CRM. Il PMS per campeggi completo e gratuito.",
};

export default function FeaturesPage() {
    const featureSections = [
        {
            title: "Controllo Totale",
            description: "Una dashboard potente per avere sempre il polso della situazione.",
            icon: LayoutDashboard,
            demo: <DemoStatsWidget />,
            features: [
                {
                    title: "Dashboard Intuitiva",
                    description: "Tieni sotto controllo arrivi, partenze e occupazione in tempo reale con una sola occhiata.",
                    icon: BarChart3
                },
                {
                    title: "Calendario Occupazione",
                    description: "Visualizza graficamente lo stato delle piazzole. Una griglia chiara ti mostra chi c'è e chi sta arrivando.",
                    icon: Calendar
                },
                {
                    title: "Statistiche Avanzate",
                    description: "Grafici predittivi sull'occupazione settimanale per pianificare meglio le risorse.",
                    icon: Zap
                }
            ]
        },
        {
            title: "Operatività Semplificata",
            description: "Strumenti pensati per velocizzare il lavoro quotidiano in reception.",
            icon: UserCheck,
            demo: <DemoCheckInWidget />,
            features: [
                {
                    title: "Smart Check-in",
                    description: "Registrazione rapida degli ospiti con autocomplete per Comuni e Province italiane.",
                    icon: UserCheck
                },
                {
                    title: "Gestione Clienti (CRM)",
                    description: "Un database completo dei tuoi ospiti con storico prenotazioni e contatti rapidi (Email/Telefono).",
                    icon: Users
                },
                {
                    title: "Integrazione Questura",
                    description: "Tieni traccia degli invii al portale Alloggiati Web. Segna chi è stato inviato e chi no.",
                    icon: ShieldCheck
                },
                {
                    title: "Ricerca Potenziata",
                    description: "Trova prenotazioni e clienti in un attimo cercando per nome, email o numero di telefono.",
                    icon: Search
                }
            ]
        },
        {
            title: "Pianificazione Visiva",
            description: "Il cuore del tuo campeggio: un calendario interattivo per la gestione delle piazzole.",
            icon: Calendar,
            demo: <DemoCalendarWidget />,
            features: [
                {
                    title: "Drag & Drop (Coming Soon)",
                    description: "Sposta le prenotazioni con rapidità (feature in arrivo).",
                    icon: BarChart3
                },
                {
                    title: "Vista Matrice",
                    description: "Incrocia piazzole e giorni per trovare subito i buchi liberi.",
                    icon: Database
                },
                {
                    title: "Filtri Avanzati",
                    description: "Filtra per tipologia (Tenda, Camper, Bungalow) o per zona del campeggio.",
                    icon: Globe
                }
            ]
        },
        {
            title: "Tecnologia & Controllo",
            description: "Sotto il cofano, strumenti per sviluppatori e amministratori esigenti.",
            icon: Database,
            demo: <DemoSystemWidget />,
            features: [
                {
                    title: "System Monitor",
                    description: "Una 'Scatola Nera' per monitorare la salute del server, i log di errore e le performance del database.",
                    icon: BarChart3
                },
                {
                    title: "Azioni Amministrative",
                    description: "Pannello di controllo per reset dati, pulizia log e gestione avanzata in caso di emergenza.",
                    icon: Database
                },
                {
                    title: "Open Source & Self-Host",
                    description: "Il codice è tuo. Puoi ospitarlo dove vuoi e modificarlo come preferisci.",
                    icon: Globe
                }
            ]
        }
    ];

    return (
        <div className="bg-background min-h-screen">
            {/* Hero Section */}
            <section className="relative py-20 overflow-hidden bg-primary/5">
                <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10" />
                <div className="container mx-auto px-4 text-center">
                    <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary text-primary-foreground hover:bg-primary/80 mb-6">
                        <Zap className="w-3 h-3 mr-1" />
                        Feature Pack v1.0
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
                        Molto più di un semplice <span className="text-primary">Excel</span>.
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
                        CampFlow digitalizza ogni aspetto del tuo campeggio, dalla prenotazione alla segnalazione in Questura, tutto in un'unica piattaforma moderna.
                    </p>
                    <div className="flex justify-center gap-4">
                        <Link href="/w/pricing">
                            <Button size="lg" className="h-12 px-8">Vedi i Prezzi</Button>
                        </Link>
                        <Link href="/w/contact">
                            <Button size="lg" variant="outline" className="h-12 px-8">Richiedi Demo</Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Main Features Grid */}
            <section className="py-20">
                <div className="container mx-auto px-4 space-y-32">
                    {featureSections.map((section, index) => (
                        <div key={index} className={`flex flex-col md:flex-row gap-16 items-start ${index % 2 === 1 ? 'md:flex-row-reverse' : ''}`}>
                            <div className="flex-1 space-y-8">
                                <div className="space-y-4">
                                    <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center text-primary">
                                        <section.icon className="w-6 h-6" />
                                    </div>
                                    <h2 className="text-3xl font-bold">{section.title}</h2>
                                    <p className="text-xl text-muted-foreground">
                                        {section.description}
                                    </p>
                                </div>
                                <div className="grid gap-6">
                                    {section.features.map((feature, fIndex) => (
                                        <div key={fIndex} className="flex gap-4 p-4 rounded-xl border bg-card hover:bg-muted/50 transition-colors">
                                            <div className="mt-1 bg-muted w-10 h-10 rounded-full flex items-center justify-center shrink-0">
                                                <feature.icon className="w-5 h-5 text-foreground" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-lg mb-1">{feature.title}</h3>
                                                <p className="text-muted-foreground text-sm leading-relaxed">
                                                    {feature.description}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Visual Placeholder / Abstract Representation */}
                            {/* Visual Representation or Live Demo */}
                            <div className="flex-1 w-full relative">
                                <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent blur-3xl rounded-full opacity-30" />
                                {section.demo ? (
                                    <div className="relative bg-card border rounded-2xl shadow-2xl overflow-hidden min-h-[400px] flex flex-col">
                                        <div className="p-1 bg-muted/50 border-b flex gap-1.5 px-4 items-center h-10">
                                            <div className="w-3 h-3 rounded-full bg-red-400/50" />
                                            <div className="w-3 h-3 rounded-full bg-yellow-400/50" />
                                            <div className="w-3 h-3 rounded-full bg-green-400/50" />
                                            <div className="ml-4 text-xs text-muted-foreground font-mono bg-background/50 px-2 py-0.5 rounded-md flex-1 text-center">
                                                campflow-demo.app
                                            </div>
                                        </div>
                                        <div className="flex-1 bg-muted/10 p-4 flex flex-col justify-center">
                                            {section.demo}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="relative bg-card border rounded-2xl shadow-2xl p-8 aspect-square md:aspect-auto md:min-h-[500px] flex flex-col items-center justify-center text-center space-y-6">
                                        <div className="p-4 bg-muted/30 rounded-full mb-4">
                                            <section.icon className="w-24 h-24 text-primary/40 stroke-1" />
                                        </div>
                                        <div className="space-y-2 max-w-sm">
                                            <h4 className="text-xl font-medium text-foreground">Progettato per l'efficienza</h4>
                                            <p className="text-muted-foreground text-sm">
                                                Ogni interfaccia è studiata per ridurre i click e massimizzare la velocità operativa.
                                            </p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 w-full max-w-xs mt-8 opacity-50">
                                            <div className="h-2 bg-primary/20 rounded"></div>
                                            <div className="h-2 bg-primary/20 rounded"></div>
                                            <div className="h-2 bg-primary/20 rounded col-span-2"></div>
                                            <div className="h-20 bg-primary/10 rounded col-span-2"></div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Additional "Grid" of smaller features */}
            <section className="py-20 bg-muted/30 border-y">
                <div className="container mx-auto px-4">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <h2 className="text-3xl font-bold mb-4">E non finisce qui...</h2>
                        <p className="text-muted-foreground">
                            Piccoli dettagli che fanno una grande differenza nella gestione quotidiana.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { title: "Mobile Friendly", desc: "Gestisci tutto anche da tablet o smartphone mentre giri per il campeggio." },
                            { title: "Dark Mode", desc: "Interfaccia scura elegante che riposa la vista durante i turni serali." },
                            { title: "Log delle Attività", desc: "Tieni traccia di chi ha fatto cosa per la massima trasparenza." },
                            { title: "Backup Automatici", desc: "I tuoi dati sono al sicuro nel cloud, replicati e protetti." },
                            { title: "Filtri Personalizzati", desc: "Crea viste personalizzate della lista arrivi e partenze." },
                            { title: "Supporto Whatsapp", desc: "Pulsanti rapidi per contattare gli ospiti su Whatsapp Web." }
                        ].map((item, i) => (
                            <div key={i} className="bg-background p-6 rounded-xl border hover:border-primary/50 transition-colors">
                                <div className="flex items-center gap-3 mb-3">
                                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                                    <h3 className="font-semibold">{item.title}</h3>
                                </div>
                                <p className="text-sm text-muted-foreground">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Footer */}
            <section className="py-24 bg-primary text-primary-foreground">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-6">Pronto a modernizzare il tuo campeggio?</h2>
                    <p className="text-primary-foreground/80 text-lg mb-10 max-w-2xl mx-auto">
                        Inizia oggi stesso. Senza costi nascosti, senza vincoli.
                    </p>
                    <Link href="/w/contact">
                        <Button size="lg" variant="secondary" className="h-14 px-10 text-lg shadow-lg hover:shadow-xl transition-all">
                            Parla con Simone
                        </Button>
                    </Link>
                </div>
            </section>
        </div>
    );
}
