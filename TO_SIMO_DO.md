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

- [ ] Verificare "Clear Bookings":
    1.  Creare una prenotazione qualsiasi.
    2.  Andare su `/sys-monitor`.
    3.  Cliccare su "CLEAR BOOKINGS".
    4.  Confermare digitando "CLEAR".
    5.  Verificare che le prenotazioni siano sparite ma le piazzole/stagioni siano rimaste invariate.
