import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle2, BarChart3, Users, Calendar, LayoutDashboard, Tent, Smartphone, ShieldCheck, Zap } from 'lucide-react';
import { DemoHeroDashboard } from '@/components/website/demos/DemoHeroDashboard';

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden bg-background">
        {/* Background Gradients */}
        <div className="absolute top-0 center-0 -z-10 h-full w-full bg-background">
          <div className="absolute top-0 h-[500px] w-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
        </div>

        <div className="container mx-auto px-4 text-center z-10 relative">
          <div className="inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium transition-colors focus:outline-none border-primary/20 bg-primary/5 text-primary mb-6 backdrop-blur-sm">
            <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
            La Soluzione Open Source Definitiva
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/60 leading-tight pb-2">
            Il Tuo Campeggio, <br />
            Gestito col Pilota Automatico.
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed">
            Dimentica i vecchi software lenti e complessi. <br className="hidden sm:block" />
            CampFlow ti dà il controllo totale su prenotazioni, ospiti e check-in.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
            <Link href="/w/contact">
              <Button size="lg" className="h-14 px-8 text-lg rounded-full shadow-lg hover:shadow-primary/25 transition-all">
                Inizia Gratis Ora <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/w/features">
              <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-full">
                Esplora Funzionalità
              </Button>
            </Link>
          </div>

          {/* Hero Dashboard Preview */}
          <div className="relative mx-auto max-w-6xl perspective-1000">
            {/* Glow Effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 to-blue-600/30 rounded-2xl blur-2xl opacity-50 -z-10" />

            {/* The Dashboard Widget */}
            <div className="rounded-xl ring-1 ring-border shadow-2xl bg-background/50 backdrop-blur-sm transform transition-all hover:scale-[1.01] duration-500">
              <DemoHeroDashboard />
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      {/* Bento Grid Features */}
      <section className="py-32 bg-background relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold tracking-tight mb-6">Tutto quello che ti serve. <br /> E anche di più.</h2>
            <p className="text-muted-foreground text-xl max-w-2xl mx-auto">
              Non solo prenotazioni. CampFlow gestisce l'intero ciclo di vita del tuo ospite.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Card Grande 1 - Calendar */}
            <div className="md:col-span-2 p-8 rounded-3xl border bg-card hover:bg-muted/30 transition-colors group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                <Calendar className="w-48 h-48" />
              </div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 text-primary">
                  <Calendar className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Planning Visivo</h3>
                <p className="text-muted-foreground text-lg max-w-md">
                  Un calendario drag & drop che ti fa vedere tutto a colpo d'occhio.
                  Sposta prenotazioni, blocca piazzole e gestisci gruppi con la semplicità di un disegno.
                </p>
              </div>
            </div>

            {/* Card 2 - Stats */}
            <div className="p-8 rounded-3xl border bg-card hover:bg-muted/30 transition-colors group relative overflow-hidden">
              <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6 text-blue-600">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Analytics Pro</h3>
              <p className="text-muted-foreground">
                Previsioni di occupazione e report incassi in tempo reale. Prendi decisioni basate sui dati, non sull'istinto.
              </p>
            </div>

            {/* Card 3 - Ops */}
            <div className="p-8 rounded-3xl border bg-card hover:bg-muted/30 transition-colors group relative overflow-hidden">
              <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center mb-6 text-green-600">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Velocità Supersonica</h3>
              <p className="text-muted-foreground">
                Check-in in 30 secondi. Ricerca istantanea. Tutto è ottimizzato per non farti perdere tempo.
              </p>
            </div>

            {/* Card Grande 2 - CRM */}
            <div className="md:col-span-2 p-8 rounded-3xl border bg-card hover:bg-muted/30 transition-colors group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                <Users className="w-48 h-48" />
              </div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-6 text-purple-600">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold mb-3">CRM Ospiti Integrato</h3>
                <p className="text-muted-foreground text-lg max-w-md">
                  Conosci i tuoi clienti. Storico soggiorni, preferenze, segnalazioni e invio automatico schede alloggiati.
                  Fidelizza i tuoi ospiti migliori.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">Pronto a migliorare il tuo campeggio?</h2>
          <p className="text-primary-foreground/80 text-lg md:text-xl max-w-2xl mx-auto mb-10">
            Unisciti agli altri campeggi che gestiscono le loro operazioni con CampFlow.
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
