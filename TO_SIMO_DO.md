# TO_SIMO_DO

Implementare come variabili dei prezzi:
- macchina
- bambini

- [ ] **Configurazione Prezzi**: Vai su `Impostazioni > Prezzi` e configura i nuovi campi:
    - Prezzo Auto (€/giorno)
    - Prezzo Bambino (€/giorno)
    - Età Massima Bambino (anni) - definisce fino a quale età si applica la tariffa ridotta.
    - Clicca su "Salva Modifiche".

- [ ] Crea un account su [Vercel](https://vercel.com) (login con GitHub).
- [ ] Importa il repository `CampFlow` in un nuovo progetto Vercel.
- [ ] In "Project Settings" > "Environment Variables", aggiungi tutte le variabili presenti nel tuo file `.env.local` (o `env.example`).
- [ ] Esegui il deploy.
- [ ] (Opzionale) Se vuoi massimizzare le performance, applica la migration SQL: copiare il contenuto di `supabase/migrations/20260120140000_get_weekly_occupancy.sql` nell'Editor SQL di Supabase.
- [ ] **Verifica validazione Check-in**: Prova a fare un check-in lasciando dei campi vuoti (es. Numero Documento o Data Nascita) e controlla che il sistema blocchi l'operazione e **evidenzi i campi mancanti in rosso**.