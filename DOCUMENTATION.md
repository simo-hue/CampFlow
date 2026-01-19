# Documentazione CampFlow

## 1. Dashboard

### 1.1 Ricerca Disponibilità (Availability Search)
**Stato**: Implementato
**Descrizione**:
La sezione "Cerca Piazzole Disponibili" nella dashboard è stata aggiornata per offrire un'esperienza utente più fluida.
- **Auto-Search**: Il pulsante "Cerca" è stato rimosso. La ricerca avviene automaticamente non appena vengono selezionate entrambe le date di arrivo e partenza.
- **Risultati**: La tabella dei risultati appare solo quando la ricerca ha prodotto dei dati. Se le date non sono selezionate o sono incomplete, l'area dei risultati rimane vuota per mantenere l'interfaccia pulita.
- **Validazione**: La ricerca non parte se manca una delle due date.
- **Debounce**: Implementato un leggero ritardo (500ms) per evitare chiamate API eccessive durante la selezione rapida.

**File Coinvolti**:
- `src/components/dashboard/AvailabilityModule.tsx`: Componente principale refactorizzato per usare `useEffect` al posto di `handleSearch`.

## 2. Customer Management
**Stato**: Aggiornato (2026-01-19)

### 2.1 Schema Dati Cliente (Customers Table)
La tabella `customers` è stata estesa per supportare le richieste della Pubblica Sicurezza e dati statistici.

**Nuovi Campi**:
- **Anagrafica**:
  - `first_name`, `last_name` (Sostituisce `full_name`)
  - `birth_date` (Data di nascita)
  - `birth_country`, `birth_city`, `birth_province` (Luogo di nascita)
  - `citizenship` (Cittadinanza)
  - `gender` (Sesso: M/F/Other)
- **Residenza**:
  - `residence_country`, `residence_city`, `residence_province`, `residence_zip`
  - `address` (Indirizzo via/civico)
- **Documenti**:
  - `document_type` (Carta Identità, Passaporto, Patente, Altro)
  - `document_number`
  - `document_issue_date`, `document_issue_place` (Comune/Ente), `document_issue_country`

### 2.2 Creazione Prenotazione
Il modale di creazione prenotazione permette ora di inserire tutti i dettagli del "Capo Gruppo" (intestatario).
- Validazione campi obbligatori base (Nome, Cognome).
- Sezioni espandibili per dettagli aggiuntivi (opzionali in fase di bozza, ma consigliati).

### 2.3 API Endpoints
- **GET /api/customers**: Ricerca per nome, cognome, email o telefono.
- **POST /api/customers**: Creazione cliente con supporto per tutti i nuovi campi.
- **POST /api/bookings**: Supporta creazione atomica Cliente + Prenotazione. Se il cliente esiste (match per telefono), i suoi dati vengono aggiornati.
