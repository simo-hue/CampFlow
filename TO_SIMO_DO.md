# TO_SIMO_DO

Lista delle cose da fare.

- [ ] Crea un account su [Vercel](https://vercel.com) (login con GitHub).
- [ ] Importa il repository `CampFlow` in un nuovo progetto Vercel.
- [ ] In "Project Settings" > "Environment Variables", aggiungi tutte le variabili presenti nel tuo file `.env.local` (o `env.example`).
- [ ] Esegui il deploy.
- [ ] (Opzionale) Se vuoi massimizzare le performance, applica la migration SQL: copiare il contenuto di `supabase/migrations/20260120140000_get_weekly_occupancy.sql` nell'Editor SQL di Supabase.
- [ ] **Verifica validazione Check-in**: Prova a fare un check-in lasciando dei campi vuoti (es. Numero Documento o Data Nascita) e controlla che il sistema blocchi l'operazione e **evidenzi i campi mancanti in rosso**.