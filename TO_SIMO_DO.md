# MANUAL ACTIONS REQUIRED

1. **Database Migrations**: Run the new migrations to add missing columns.
   - Run: `supabase/migrations/add_booking_extras_columns.sql`
   - Run: `supabase/migrations/add_recurring_seasons.sql`
   (Eseguili nel SQL Editor di Supabase).

2. **Imposta le Stagioni come Ricorrenti**:
   - Vai in **Settings -> Stagioni**.
   - Ora troverai un'opzione "Ricorrente Annualmente" (già attiva per le nuove stagioni).
   - Per le stagioni esistenti, assicurati che sia attiva se vuoi che l'anno venga ignorato.
   - In questo modo, le tue impostazioni per Agosto funzioneranno ogni anno senza dover cambiare le date!

3. **Verify Pricing**: After updating the dates, create a test booking for August to verify that the "Alta Stagione" rate is correctly applied.
