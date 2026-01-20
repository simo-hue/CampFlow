# TO DO LIST

- [ ] Verificare la Statistica "Andamento Ricavi":
    1.  Aprire la dashboard `/stats`.
    2.  Verificare che sia presente il selettore (7gg, 30gg, ecc.) *dentro* la card del grafico.
    3.  Provare a cambiare intervallo; il grafico dovrebbe aggiornarsi (loading spinner -> nuovi dati).
    4.  Il KPI box "Ricavi Totali" in alto dovrebbe rimanere invariato (dipende dal selettore globale in alto).

- [ ] Verificare il "System Reset" (`/sys-monitor`):
    1.  Andare su `/sys-monitor` (Login se necessario).
    2.  Trovare il pannello "Danger Zone".
    3.  Cliccare su "SYSTEM RESET".
    4.  Provare a confermare senza scrivere "RESET" (il bottone dovrebbe essere disabilitato).
    5.  Scrivere "RESET" e confermare.
    6.  Verificare che il sistema sia pulito (Dashboard vuota, nessuna prenotazione) e le piazzole siano resettate a 15.

- [ ] Verificare "Database Management":
    1.  **Clear/Seed Pitches**:
        -   Cliccare "Clear Pitches" -> Confermare "PITCHES".
        -   Verificare che la home page non mostri piazzole.
        -   Cliccare "Seed Pitches" -> Confermare "SEED".
        -   Verificare che le piazzole siano tornate.
    2.  **Clear/Seed Seasons**:
        -   Cliccare "Clear Seasons" -> Confermare "SEASONS".
        -   Cliccare "Seed Seasons" -> Confermare "SEED".
    3.  **Clear Bookings**:
        -   Verificare che cancelli solo le prenotazioni.
    4.  **Clear Customers**:
        -   Verificare che cancelli clienti e prenotazioni.
    5.  **Factory Reset**:
        -   Verificare che riporti tutto allo stato iniziale.
