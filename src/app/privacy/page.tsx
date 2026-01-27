export default function PrivacyPage() {
    return (
        <div className="container mx-auto px-4 py-24 max-w-3xl">
            <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>

            <div className="prose prose-zinc dark:prose-invert max-w-none space-y-8">
                <section>
                    <h2 className="text-2xl font-semibold mb-4">1. Nessuna Raccolta Dati</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        CampFlow è un progetto <strong>Open Source</strong> progettato per la massima trasparenza e privacy.
                        Questo sito web (ospitato su GitHub Pages) e l'applicazione stessa <strong>non utilizzano cookie di tracciamento</strong>,
                        non contengono script analitici di terze parti (come Google Analytics o Facebook Pixel) e non raccolgono dati personali a fini di marketing.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">2. Dati Inseriti nell'Applicazione</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        Qualsiasi dato inserito nella demo o nell'applicazione self-hosted (nomi ospiti, prenotazioni, ecc.) risiede esclusivamente:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-4">
                        <li>Nella memoria locale del tuo browser (per le demo live).</li>
                        <li>Nel tuo database personale (se decidi di installare e ospitare CampFlow sui tuoi server).</li>
                    </ul>
                    <p className="text-muted-foreground leading-relaxed mt-4">
                        Noi sviluppatori di CampFlow non abbiamo alcun accesso ai tuoi dati operativi. I dati sono tuoi e restano tuoi.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">3. GitHub Pages</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        Questo sito è ospitato su GitHub Pages. GitHub potrebbe raccogliere log tecnici di base (es. indirizzo IP per fini di sicurezza e accesso)
                        come parte standard dell'erogazione del servizio di hosting, come indicato nella <a href="https://docs.github.com/en/site-policy/privacy-policies/github-privacy-statement" target="_blank" className="text-primary hover:underline">Privacy Statement di GitHub</a>.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">4. Contatti</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        Se hai domande tecniche o curiosità sul codice, puoi aprire una Issue sul <a href="https://github.com/simo-hue" className="text-primary hover:underline">repository GitHub</a>.
                    </p>
                </section>

                <div className="pt-8 border-t text-sm text-muted-foreground">
                    Ultimo aggiornamento: {new Date().toLocaleDateString('it-IT')}
                </div>
            </div>
        </div>
    );
}
