import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle2, BarChart3, Users, Calendar, LayoutDashboard, Tent } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4 text-center z-10 relative">
          <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary/10 text-primary hover:bg-primary/20 mb-6">
            Nuova Versione 2.0 Rilasciata
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
            Gestisci il tuo Campeggio <br className="hidden md:block" /> con Flow
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            La piattaforma all-in-one per ottimizzare prenotazioni, gestione ospiti e monitoraggio occupazione. Progettata per il turismo all'aria aperta moderno.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/w/contact">
              <Button size="lg" className="h-12 px-8 text-base">
                Prova Gratuita <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            <Link href="/w/features">
              <Button size="lg" variant="outline" className="h-12 px-8 text-base">
                Vedi Demo
              </Button>
            </Link>
          </div>

          {/* Hero Image Mockup */}
          <div className="mt-16 md:mt-24 rounded-xl border border-border/50 shadow-2xl overflow-hidden bg-background">
            {/* Placeholder for App Screenshot */}
            <div className="aspect-[16/9] bg-muted relative flex items-center justify-center group overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-primary/5 opacity-50"></div>
              <div className="grid grid-cols-4 gap-4 p-8 w-full h-full opacity-30 scale-95 blur-[1px] group-hover:blur-0 group-hover:scale-100 transition-all duration-700">
                {/* Abstract UI Representation */}
                <div className="col-span-1 bg-foreground/10 rounded-lg h-full"></div>
                <div className="col-span-3 flex flex-col gap-4">
                  <div className="h-12 bg-foreground/10 rounded-lg w-full"></div>
                  <div className="flex-1 bg-foreground/10 rounded-lg w-full"></div>
                </div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-muted-foreground font-medium bg-background/80 backdrop-blur px-4 py-2 rounded-full border shadow-sm">
                  Anteprima Interfaccia
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-4">Tutto ciò che ti serve per gestire il tuo parco</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Strumenti potenti per gestire le operazioni quotidiane, dal check-in al check-out.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Calendar,
                title: "Sistema di Prenotazione Intelligente",
                description: "Calendario occupazione visivo con funzionalità drag-and-drop. Gestisci le prenotazioni con facilità."
              },
              {
                icon: Users,
                title: "Gestione Ospiti (CRM)",
                description: "CRM completo per i tuoi ospiti. Traccia cronologia, preferenze e documenti in sicurezza."
              },
              {
                icon: BarChart3,
                title: "Analisi in Tempo Reale",
                description: "Monitora tassi di occupazione, entrate e tendenze con la nostra dashboard interattiva."
              },
              {
                icon: LayoutDashboard,
                title: "Mappa Interattiva",
                description: "Visualizza l'intera mappa del campeggio. Controlla lo stato delle piazzole a colpo d'occhio."
              },
              {
                icon: CheckCircle2,
                title: "Check-in Automatizzato",
                description: "Velocizza gli arrivi con flussi di check-in digitale e comunicazioni email automatiche."
              },
              {
                icon: Tent,
                title: "Ottimizzazione Piazzole",
                description: "Massimizza le entrate ottimizzando l'assegnazione delle piazzole in base a dimensioni, tipo e date."
              }
            ].map((feature, i) => (
              <div key={i} className="p-6 rounded-2xl border bg-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 text-primary">
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">Pronto a migliorare il tuo campeggio?</h2>
          <p className="text-primary-foreground/80 text-lg md:text-xl max-w-2xl mx-auto mb-10">
            Unisciti a oltre 500 campeggi che gestiscono le loro operazioni con CampFlow.
          </p>
          <Link href="/w/contact">
            <Button size="lg" variant="secondary" className="h-14 px-8 text-lg shadow-xl hover:shadow-2xl transition-all">
              Inizia Gratis
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
