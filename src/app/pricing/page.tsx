import { Button } from '@/components/ui/button';
import { Check, Github, Server, LifeBuoy } from 'lucide-react';
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Prezzi | CampFlow Cloud vs Self-Hosted",
    description: "CampFlow è Gratis e Open Source. Offriamo piani Cloud gestiti per chiamate assistenza e setup server per chi preferisce una soluzione chiavi in mano.",
};

export default function PricingPage() {
    const tiers = [
        {
            name: 'Community',
            price: 'Gratis',
            description: 'Per sviluppatori e chi sa gestirsi il server in autonomia.',
            icon: Github,
            features: [
                'Codice Open Source completo',
                'Self-hosting illimitato',
                'Aggiornamenti manuali',
                'Nessun costo di licenza',
                'Supporto Community',
            ],
            cta: 'Vai su GitHub',
            href: 'https://github.com/simo-hue',
            variant: 'outline',
            target: '_blank',
            popular: false,
            blurPrice: false,
        },
        {
            name: 'Setup Assistito',
            price: '€499',
            period: 'una tantum',
            description: 'Vuoi il Software ma non sei un esperto? Ti aiutiamo noi.',
            icon: LifeBuoy,
            features: [
                'Installazione in locale',
                'Configurazione del campeggio',
                '1 ora di formazione staff',
                '30 giorni di supporto post-setup',
            ],
            cta: 'Prenota il Tuo Setup Assistito',
            href: '/contact',
            variant: 'outline',
            target: '_self',
            popular: false,
            blurPrice: false,
        },
        {
            name: 'Cloud Managed',
            price: '€499',
            period: 'Personalizzato',
            blurPrice: true,
            description: 'La soluzione chiavi in mano. Pensiamo a tutto noi.',
            icon: Server,
            features: [
                'Tutto pronto all\'uso',
                'Hosting e Server incluso',
                'Backup Dei Dati',
                'Aggiornamenti automatici',
                'Supporto Email Prioritario',
            ],
            cta: 'Parliamone Insieme',
            href: 'mailto:mattioli.simone.10@gmail.com',
            variant: 'default',
            target: '_self',
            popular: false,
        },
    ];

    return (
        <div className="py-20 bg-background">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-bold mb-4">Open Source, con Servizi Premium</h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        CampFlow è gratuito e libero. Paghi solo se vuoi che lo gestiamo noi per te o se hai bisogno di aiuto per l'installazione.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {tiers.map((tier) => (
                        <div
                            key={tier.name}
                            className={`flex flex-col p-8 bg-card border rounded-2xl shadow-sm hover:shadow-md transition-all relative ${tier.popular ? 'border-primary ring-1 ring-primary shadow-lg scale-105 z-10' : ''}`}
                        >
                            {tier.popular && (
                                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                    <span className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                                        Più Popolare
                                    </span>
                                </div>
                            )}

                            <div className="mb-6">
                                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 text-primary">
                                    <tier.icon className="w-6 h-6" />
                                </div>
                                <h3 className="text-2xl font-bold">{tier.name}</h3>
                                <p className="text-sm text-muted-foreground mt-2">{tier.description}</p>
                            </div>

                            <div className="mb-8">
                                <span className={`text-4xl font-bold ${tier.blurPrice ? 'blur-md select-none' : ''}`}>
                                    {tier.price}
                                </span>
                                {tier.period && <span className="text-muted-foreground text-sm font-medium ml-1">{tier.period}</span>}
                            </div>

                            <ul className="flex-1 space-y-4 mb-8">
                                {tier.features.map((feature) => (
                                    <li key={feature} className="flex items-center gap-3 text-sm">
                                        <div className="bg-primary/10 p-1 rounded-full text-primary shrink-0">
                                            <Check className="w-3 h-3" />
                                        </div>
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <Link href={tier.href} target={tier.target}>
                                <Button className="w-full" variant={tier.variant as any} size="lg">
                                    {tier.cta}
                                </Button>
                            </Link>
                        </div>
                    ))}
                </div>

                {/* FAQ Section */}
                <div className="mt-24 max-w-3xl mx-auto">
                    <h2 className="text-2xl font-bold text-center mb-8">Domande Frequenti</h2>
                    <div className="grid gap-6">
                        <div className="bg-card p-6 rounded-xl border">
                            <h3 className="font-semibold mb-2">Davvero è gratis?</h3>
                            <p className="text-muted-foreground text-sm">
                                Sì, la versione Community è 100% open source. Puoi scaricare il codice, installarlo sul tuo server e usarlo senza limiti, per sempre.
                            </p>
                        </div>
                        <div className="bg-card p-6 rounded-xl border">
                            <h3 className="font-semibold mb-2">Cosa include la "Gestione Cloud"?</h3>
                            <p className="text-muted-foreground text-sm">
                                Include l'hosting su server performanti, la configurazione di sicurezza, i backup automatici e gli aggiornamenti del software. Tu ti occupi solo di gestire il tuo campeggio, a tutto il resto pensiamo noi.
                            </p>
                        </div>
                        <div className="bg-card p-6 rounded-xl border">
                            <h3 className="font-semibold mb-2">Posso passare dalla versione Cloud a quella Self-hosted?</h3>
                            <p className="text-muted-foreground text-sm">
                                Assolutamente sì. I dati sono tuoi. Puoi richiedere un export del database in qualsiasi momento e migrare sul tuo server privato.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
