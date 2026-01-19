# Azioni Manuali Richieste - CampFlow PMS

---

## ✅ Implementato (Non serve azione)

### Database Schema
- ✅ Eseguita migrazione `10_update_customers_schema.sql` per aggiornamento tabella `customers` con nuovi campi (nascita, residenza, documenti).

### UI Updates
- ✅ Aggiornato modale prenotazione con sezioni espandibili per i nuovi dati

### API Updates
- ✅ Aggiornato `/api/bookings` per gestire la creazione clienti con nuovi dati
- ✅ Creato/Aggiornato `/api/customers` per ricerca e creazione

---

## 🔍 Test Consigliati
1. Apri "Nuova Prenotazione" dalla dashboard.
2. Inserisci un nuovo cliente compilando ANCHE i campi documento e nascita.
3. Salva la prenotazione.
4. Verifica nel database che i dati siano stati salvati correttamente nella tabella `customers`.
