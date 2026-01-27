import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"

import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "FAQ | Domande Frequenti su CampFlow",
    description: "Tutte le risposte sulle funzionalità, l'installazione e l'utilizzo di CampFlow. Scopri come gestire il tuo campeggio col nostro software open source.",
};

export default function FAQPage() {
    return (
        <div className="py-20 bg-background">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-bold mb-4">Domande Frequenti (FAQ)</h1>
                    <p className="text-xl text-muted-foreground">Tutto quello che devi sapere su CampFlow e il suo sviluppatore.</p>
                </div>

                <div className="space-y-8">
                    {/* Generali */}
                    <section>
                        <h2 className="text-2xl font-semibold mb-4 text-primary">Generali</h2>
                        <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="gen-1">
                                <AccordionTrigger>Cos'è CampFlow?</AccordionTrigger>
                                <AccordionContent>
                                    CampFlow è una piattaforma open-source all-in-one per la gestione di campeggi, villaggi turistici e aree di sosta camper. Permette di gestire prenotazioni, ospiti, piazzole e check-in da un'unica interfaccia moderna.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="gen-2">
                                <AccordionTrigger>È davvero gratuito?</AccordionTrigger>
                                <AccordionContent>
                                    Sì! La versione "Community" è 100% gratuita e open-source. Puoi scaricare il codice e installarlo sul tuo server senza pagare licenze. Offriamo anche servizi a pagamento per chi preferisce una soluzione gestita (Cloud) o assistenza tecnica.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="gen-3">
                                <AccordionTrigger>A chi si rivolge?</AccordionTrigger>
                                <AccordionContent>
                                    È ideale per gestori di strutture ricettive all'aria aperta di qualsiasi dimensione, dai piccoli agricampeggi ai grandi villaggi turistici che cercano una soluzione moderna e flessibile.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="gen-4">
                                <AccordionTrigger>Posso provarlo prima di installarlo?</AccordionTrigger>
                                <AccordionContent>
                                    Certamente. Contattaci per accedere a una demo live o guarda i video dimostrativi nella sezione Funzionalità.
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </section>

                    {/* Tecniche */}
                    <section>
                        <h2 className="text-2xl font-semibold mb-4 text-primary">Tecniche & Installazione</h2>
                        <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="tech-1">
                                <AccordionTrigger>Quali tecnologie utilizza?</AccordionTrigger>
                                <AccordionContent>
                                    CampFlow è costruito con tecnologie moderne: Next.js (React) per il frontend e backend, Supabase (PostgreSQL) come database e autenticazione, e Tailwind CSS per lo stile.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="tech-2">
                                <AccordionTrigger>Quali sono i requisiti di sistema per il self-hosting?</AccordionTrigger>
                                <AccordionContent>
                                    Hai bisogno di un server (VPS) con Node.js installato e un'istanza di Supabase (o PostgreSQL configurato). Consigliamo almeno 2GB di RAM per il server Node.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="tech-3">
                                <AccordionTrigger>È difficile da installare?</AccordionTrigger>
                                <AccordionContent>
                                    Richiede competenze di sviluppo web (git, npm, gestione variabili d'ambiente). Se non hai queste competenze, il piano "Setup Assistito" o "Cloud Managed" fa al caso tuo.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="tech-4">
                                <AccordionTrigger>Il codice è sicuro?</AccordionTrigger>
                                <AccordionContent>
                                    La sicurezza è una priorità. Utilizziamo l'autenticazione robusta di Supabase e middleware per proteggere le rotte sensibili. Il codice è pubblico, il che permette alla community di revisionarlo costantemente.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="tech-5">
                                <AccordionTrigger>Posso modificare il codice?</AccordionTrigger>
                                <AccordionContent>
                                    Assolutamente sì. La licenza open source ti permette di modificare, estendere e personalizzare il software per le tue esigenze specifiche.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="tech-6">
                                <AccordionTrigger>Supporta l'integrazione con hardware di terze parti?</AccordionTrigger>
                                <AccordionContent>
                                    Essendo open source, puoi sviluppare integrazioni con sbarre automatiche, lettori di passaporti o stampanti fiscali tramite API personalizzate.
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </section>

                    {/* Funzionalità */}
                    <section>
                        <h2 className="text-2xl font-semibold mb-4 text-primary">Funzionalità</h2>
                        <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="feat-1">
                                <AccordionTrigger>Gestisce la fatturazione elettronica?</AccordionTrigger>
                                <AccordionContent>
                                    Attualmente, CampFlow traccia i pagamenti e genera ricevute pro-forma. L'integrazione diretta con lo SDI per la fatturazione elettronica italiana è in roadmap.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="feat-2">
                                <AccordionTrigger>Posso gestire più campeggi con un account?</AccordionTrigger>
                                <AccordionContent>
                                    La versione base è ottimizzata per una singola struttura. Per gestioni multi-sito, offriamo personalizzazioni nel piano Enterprise.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="feat-3">
                                <AccordionTrigger>Il calendario supporta il drag-and-drop?</AccordionTrigger>
                                <AccordionContent>
                                    Sì, il calendario occupazione permette di spostare le prenotazioni trascinandole, rendendo la gestione del planning estremamente intuitiva.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="feat-4">
                                <AccordionTrigger>Include il check-in online?</AccordionTrigger>
                                <AccordionContent>
                                    Sì, puoi inviare un link ai clienti prima del loro arrivo per fargli compilare i dati, velocizzando le operazioni in reception.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="feat-5">
                                <AccordionTrigger>Comunica con il portale Alloggiati Web?</AccordionTrigger>
                                <AccordionContent>
                                    Stiamo lavorando a un modulo per esportare il file .txt compatibile con il portale della Polizia di Stato.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="feat-6">
                                <AccordionTrigger>C'è un limite al numero di piazzole?</AccordionTrigger>
                                <AccordionContent>
                                    Nessun limite software. Il limite dipende solo dalla potenza del tuo server.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="feat-7">
                                <AccordionTrigger>Le statistiche sono in tempo reale?</AccordionTrigger>
                                <AccordionContent>
                                    Per il Setup Assistito, se non riusciamo a completare l'installazione per problemi tecnici a noi imputabili, rimborsiamo l'intero importo.
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </section>

                    {/* Developer & Team */}
                    <section>
                        <h2 className="text-2xl font-semibold mb-4 text-primary">Sviluppatore & Team</h2>
                        <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="dev-1">
                                <AccordionTrigger>Chi ha creato CampFlow?</AccordionTrigger>
                                <AccordionContent>
                                    CampFlow è stato ideato e sviluppato da Simone Mattioli, uno studente di Informatica presso l'Università di Verona appassionato di tecnologia e outdoor.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="dev-2">
                                <AccordionTrigger>Qual è il background di Simone?</AccordionTrigger>
                                <AccordionContent>
                                    Simone ha un diploma tecnico in informatica e sta completando la laurea triennale. Ha esperienza come sviluppatore Full Stack e ha lavorato su progetti di AI e High Performance Computing (HPC).
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="dev-3">
                                <AccordionTrigger>Simone lavora da solo?</AccordionTrigger>
                                <AccordionContent>
                                    Attualmente CampFlow è mantenuto principalmente da Simone, ma essendo open source, accetta contributi da altri sviluppatori della community.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="dev-4">
                                <AccordionTrigger>Ha esperienza nel settore?</AccordionTrigger>
                                <AccordionContent>
                                    Oltre alle competenze tecniche, Simone ha fatto volontariato internazionale (Brasile) e ha fatto parte dello staff della Coppa del Mondo di Downhill, dimostrando capacità organizzative e di lavoro in team in contesti dinamici.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="dev-5">
                                <AccordionTrigger>Perché un progetto open source?</AccordionTrigger>
                                <AccordionContent>
                                    Simone crede nella condivisione della conoscenza e nell'accessibilità del software. Rendere CampFlow open source permette di aiutare le piccole realtà e di migliorare il software grazie al feedback collettivo.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="dev-6">
                                <AccordionTrigger>Come posso contattare lo sviluppatore?</AccordionTrigger>
                                <AccordionContent>
                                    Puoi trovarlo su LinkedIn (Simone Mattioli), GitHub (simo-hue) o contattarlo direttamente tramite il modulo di contatto su questo sito.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="dev-7">
                                <AccordionTrigger>Quali sono le passioni di Simone?</AccordionTrigger>
                                <AccordionContent>
                                    È un amante della montagna, della fauna selvatica e dell'esplorazione outdoor. Questa passione si riflette nella cura per un software dedicato al turismo all'aria aperta.
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </section>

                    {/* Prezzi & Supporto */}
                    <section>
                        <h2 className="text-2xl font-semibold mb-4 text-primary">Prezzi & Supporto</h2>
                        <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="sup-1">
                                <AccordionTrigger>Cosa include il piano "Setup Assistito"?</AccordionTrigger>
                                <AccordionContent>
                                    Include l'installazione completa sul tuo server, la configurazione del dominio, del certificato SSL e una sessione di formazione iniziale per il tuo staff.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="sup-2">
                                <AccordionTrigger>Offrite assistenza 24/7?</AccordionTrigger>
                                <AccordionContent>
                                    L'assistenza standard è via email nei giorni lavorativi. Piani di supporto SLA personalizzati sono disponibili per i clienti Enterprise.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="sup-3">
                                <AccordionTrigger>Accettate pagamenti con carta di credito?</AccordionTrigger>
                                <AccordionContent>
                                    Sì, per i piani Cloud Managed e le consulenze accettiamo bonifici e principali carte di credito.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="sup-4">
                                <AccordionTrigger>Posso cancellare l'abbonamento Cloud in qualsiasi momento?</AccordionTrigger>
                                <AccordionContent>
                                    Sì, non ci sono vincoli a lungo termine. Puoi cancellare mensilmente ed esportare i tuoi dati.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="sup-5">
                                <AccordionTrigger>Fate rimborsi?</AccordionTrigger>
                                <AccordionContent>
                                    ```
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </section>
                    {/* Dettagli Operativi e Avanzati */}
                    <section>
                        <h2 className="text-2xl font-semibold mb-4 text-primary">Operatività & Dettagli</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                            <Accordion type="single" collapsible className="w-full">
                                <AccordionItem value="op-1">
                                    <AccordionTrigger>È possibile gestire prenotazioni di gruppo?</AccordionTrigger>
                                    <AccordionContent>Sì, puoi creare prenotazioni multiple e associarle allo stesso capogruppo per una gestione semplificata.</AccordionContent>
                                </AccordionItem>
                            </Accordion>
                            <Accordion type="single" collapsible className="w-full">
                                <AccordionItem value="op-2">
                                    <AccordionTrigger>Posso applicare codici sconto?</AccordionTrigger>
                                    <AccordionContent>Attualmente i prezzi sono calcolati sui listini, la gestione coupon è in fase di sviluppo per la v2.1.</AccordionContent>
                                </AccordionItem>
                            </Accordion>
                            <Accordion type="single" collapsible className="w-full">
                                <AccordionItem value="op-3">
                                    <AccordionTrigger>Il sistema funziona su tablet?</AccordionTrigger>
                                    <AccordionContent>Sì, l'interfaccia è completamente responsive e ottimizzata per l'uso su iPad e tablet Android, perfetta per la mobilità in campeggio.</AccordionContent>
                                </AccordionItem>
                            </Accordion>
                            <Accordion type="single" collapsible className="w-full">
                                <AccordionItem value="op-4">
                                    <AccordionTrigger>Serve una connessione internet sempre attiva?</AccordionTrigger>
                                    <AccordionContent>Sì, essendo un'applicazione web basata su cloud (o server connesso), è necessaria la connessione. In caso di disconnessione, i dati non vengono persi ma non potrai salvarne di nuovi.</AccordionContent>
                                </AccordionItem>
                            </Accordion>
                            <Accordion type="single" collapsible className="w-full">
                                <AccordionItem value="op-5">
                                    <AccordionTrigger>Posso esportare i dati in Excel?</AccordionTrigger>
                                    <AccordionContent>Certamente. Quasi tutte le tabelle (Ospiti, Prenotazioni) hanno la funzione "Esporta CSV" compatibile con Excel.</AccordionContent>
                                </AccordionItem>
                            </Accordion>
                            <Accordion type="single" collapsible className="w-full">
                                <AccordionItem value="op-6">
                                    <AccordionTrigger>Gestisce la tassa di soggiorno?</AccordionTrigger>
                                    <AccordionContent>Il sistema permette di configurare costi extra fissi o per persona, utilizzabili per calcolare la tassa di soggiorno.</AccordionContent>
                                </AccordionItem>
                            </Accordion>
                            <Accordion type="single" collapsible className="w-full">
                                <AccordionItem value="op-7">
                                    <AccordionTrigger>Si collega alle stampanti fiscali?</AccordionTrigger>
                                    <AccordionContent>Non nativamente. È necessario un modulo middleware specifico per la tua stampante (Epson, RCH, ecc.) da sviluppare ad hoc.</AccordionContent>
                                </AccordionItem>
                            </Accordion>
                            <Accordion type="single" collapsible className="w-full">
                                <AccordionItem value="op-8">
                                    <AccordionTrigger>Posso personalizzare le email di conferma?</AccordionTrigger>
                                    <AccordionContent>Le email transazionali sono gestite tramite template. Nel piano self-hosted hai pieno controllo sul codice HTML delle email.</AccordionContent>
                                </AccordionItem>
                            </Accordion>
                            <Accordion type="single" collapsible className="w-full">
                                <AccordionItem value="op-9">
                                    <AccordionTrigger>C'è un limite di utenti staff?</AccordionTrigger>
                                    <AccordionContent>No, puoi creare infiniti account per il tuo staff (receptionist, manodopera, amministratori) senza costi aggiuntivi.</AccordionContent>
                                </AccordionItem>
                            </Accordion>
                            <Accordion type="single" collapsible className="w-full">
                                <AccordionItem value="op-10">
                                    <AccordionTrigger>Il database viene backuppato?</AccordionTrigger>
                                    <AccordionContent>Su Supabase (Cloud) i backup sono automatici. Se gestisci il tuo server, devi configurare tu i cronjob di backup (possiamo assisterti nel piano Setup).</AccordionContent>
                                </AccordionItem>
                            </Accordion>
                            <Accordion type="single" collapsible className="w-full">
                                <AccordionItem value="op-11">
                                    <AccordionTrigger>È conforme al GDPR?</AccordionTrigger>
                                    <AccordionContent>Il software è progettato per la privacy by design. Tuttavia, la conformità legale (nomina DPO, registro trattamenti) spetta al gestore della struttura.</AccordionContent>
                                </AccordionItem>
                            </Accordion>
                            <Accordion type="single" collapsible className="w-full">
                                <AccordionItem value="op-12">
                                    <AccordionTrigger>Posso cambiare i colori interfaccia?</AccordionTrigger>
                                    <AccordionContent>L'interfaccia supporta la modalità Chiaro/Scuro. Per cambiare i colori del brand, è necessario modificare il file di configurazione del tema Tailwind.</AccordionContent>
                                </AccordionItem>
                            </Accordion>
                            <Accordion type="single" collapsible className="w-full">
                                <AccordionItem value="op-13">
                                    <AccordionTrigger>Gestisce stagionalità multiple?</AccordionTrigger>
                                    <AccordionContent>Sì, puoi definire periodi di Alta, Media e Bassa stagione con listini prezzi differenti.</AccordionContent>
                                </AccordionItem>
                            </Accordion>
                            <Accordion type="single" collapsible className="w-full">
                                <AccordionItem value="op-14">
                                    <AccordionTrigger>Posso bloccare una piazzola per manutenzione?</AccordionTrigger>
                                    <AccordionContent>Sì, esiste lo stato "Bloccato" che impedisce nuove prenotazioni su quella risorsa per il periodo selezionato.</AccordionContent>
                                </AccordionItem>
                            </Accordion>
                            <Accordion type="single" collapsible className="w-full">
                                <AccordionItem value="op-15">
                                    <AccordionTrigger>Come gestisco i "No Show"?</AccordionTrigger>
                                    <AccordionContent>Puoi segnare la prenotazione come "Cancellata" o "No Show", liberando immediatamente la disponibilità sul calendario.</AccordionContent>
                                </AccordionItem>
                            </Accordion>
                            <Accordion type="single" collapsible className="w-full">
                                <AccordionItem value="op-16">
                                    <AccordionTrigger>C'è una mappa interattiva?</AccordionTrigger>
                                    <AccordionContent>Stiamo sviluppando un modulo SVG interattivo per visualizzare la mappa del campeggio e cliccare direttamente sulle piazzole.</AccordionContent>
                                </AccordionItem>
                            </Accordion>
                            <Accordion type="single" collapsible className="w-full">
                                <AccordionItem value="op-17">
                                    <AccordionTrigger>Chi possiede i dati dei miei clienti?</AccordionTrigger>
                                    <AccordionContent>Tu e solo tu. A differenza dei portali di booking, con CampFlow i dati sono di tua esclusiva proprietà.</AccordionContent>
                                </AccordionItem>
                            </Accordion>
                            <Accordion type="single" collapsible className="w-full">
                                <AccordionItem value="op-18">
                                    <AccordionTrigger>Posso importare dati da un vecchio gestionale?</AccordionTrigger>
                                    <AccordionContent>È possibile importare anagrafiche via CSV. Per lo storico prenotazioni, valutiamo caso per caso tramite il servizio di Setup Assistito.</AccordionContent>
                                </AccordionItem>
                            </Accordion>
                            <Accordion type="single" collapsible className="w-full">
                                <AccordionItem value="op-19">
                                    <AccordionTrigger>È multilingua?</AccordionTrigger>
                                    <AccordionContent>Il frontend pubblico è disponibile in Italiano e Inglese. Il backend gestionale è attualmente in Italiano.</AccordionContent>
                                </AccordionItem>
                            </Accordion>
                            <Accordion type="single" collapsible className="w-full">
                                <AccordionItem value="op-20">
                                    <AccordionTrigger>Cosa succede se Simone smette di svilupparlo?</AccordionTrigger>
                                    <AccordionContent>Essendo Open Source, il codice rimane a te. Qualsiasi altro sviluppatore può prenderlo in carico e continuarlo. Non sei vincolato a noi.</AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
