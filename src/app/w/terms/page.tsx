export default function TermsPage() {
    return (
        <div className="container mx-auto px-4 py-24 max-w-3xl">
            <h1 className="text-4xl font-bold mb-8">Termini e Condizioni</h1>

            <div className="prose prose-zinc dark:prose-invert max-w-none space-y-8">
                <section>
                    <h2 className="text-2xl font-semibold mb-4">1. Licenza Open Source</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        CampFlow è distribuito come software <strong>Open Source</strong>.
                        È possibile visualizzare, modificare e distribuire il codice sorgente secondo i termini specificati nella licenza presente nel repository (tipicamente MIT o Apache 2.0, fare riferimento al repo ufficiale).
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">2. Utilizzo "As Is" (Così Com'è)</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        Il software viene fornito "così com'è", senza garanzie di alcun tipo, esplicite o implicite, incluse ma non limitate alle garanzie di commerciabilità,
                        idoneità per uno scopo particolare e non violazione.
                    </p>
                    <div className="bg-muted/50 p-4 rounded-lg mt-4 border-l-4 border-primary/50">
                        <p className="text-sm">
                            In nessun caso gli autori o i detentori del copyright saranno responsabili per qualsiasi reclamo, danno o altra responsabilità,
                            sia in un'azione contrattuale, torto o altro, derivante da, o in connessione con il software o l'uso o altre operazioni nel software.
                        </p>
                    </div>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">3. Responsabilità dell'Utente</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        Chi sceglie di installare e utilizzare CampFlow per la gestione di una struttura ricettiva reale è l'unico responsabile della conformità alle leggi locali,
                        fiscali e di pubblica sicurezza (es. invio schedine alloggiati, gestione GDPR dei propri clienti).
                        Il software è uno strumento tecnico e non sostituisce la consulenza legale o fiscale professionale.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">4. Modifiche</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        Ci riserviamo il diritto di modificare questi termini in qualsiasi momento, principalmente per riflettere aggiornamenti nella struttura del progetto o requisiti di piattaforma.
                    </p>
                </section>

                <div className="pt-8 border-t text-sm text-muted-foreground">
                    Ultimo aggiornamento: {new Date().toLocaleDateString('it-IT')}
                </div>
            </div>
        </div>
    );
}
