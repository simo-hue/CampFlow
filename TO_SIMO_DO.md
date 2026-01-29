### Piano di Test Aggiornato (29/01/2026)

#### 1. Configurazione Gruppi
Assicurati di aver creato questi gruppi e bundle:

**Gruppo 1**
*   **Bundle 1 Notte**:
    *   Notti: `1`
    *   Prezzo Piazzola: **25€**
    *   Prezzo Cane: **2€**
*   **Bundle 2 Notti**:
    *   Notti: `2`
    *   Prezzo Piazzola: **36€**
    *   Prezzo Cane: **2€**

**Gruppo 2**
*   **Bundle 2 Notti**:
    *   Notti: `2`
    *   Prezzo Piazzola: **40€**
    *   Prezzo Cane: **2€**

*(Nota: Per i test misti, servono i prezzi Standard della stagione attiva. Assumeremo: Piazzola 10€, Cane 2€)*

#### 2. Scenarios di Verifica

- [ ] **Test G1-A: 1 Notte, 1 Cane (Gruppo 1)**
    *   Seleziona Gruppo 1, Date per 1 notte.
    *   Calcolo: 25€ (Piazzola) + 2€ (Cane)
    *   **Totale Atteso: 27€**

- [ ] **Test G1-B: 2 Notti, 1 Cane (Gruppo 1)**
    *   Seleziona Gruppo 1, Date per 2 notti.
    *   Calcolo: 36€ (Piazzola) + 2€ (Cane)
    *   **Totale Atteso: 38€**

- [ ] **Test G2-A: 2 Notti, 1 Cane (Gruppo 2)**
    *   Seleziona Gruppo 2, Date per 2 notti.
    *   Calcolo: 40€ (Piazzola) + 2€ (Cane)
    *   **Totale Atteso: 42€**

- [ ] **Test G1-C: 3 Notti, 1 Cane (Gruppo 1)**
    *   Seleziona Gruppo 1, Date per 3 notti (es. 2 Adulti).
    *   Bundle (2 notti): 38€ (Include persone).
    *   Standard (1 notte): 22€ (Piazzola 10 + Cane 2 + 2 Persone 10).
    *   **Totale Atteso: 60€** (Nota: La notte extra paga le persone a listino standard).

#### 3. Test Nuova Funzionalità (Prenotazione)
- [ ] **Assegnazione Gruppo da Prenotazione**
    *   Apri "Nuova Prenotazione" su una piazzola.
    *   Verifica presenza del menu a tendina "Gruppo Cliente".
    *   Crea un *nuovo* cliente assegnando il "Gruppo 1".
    *   Verifica che il prezzo si aggiorni immediatamente applicando le tariffe del gruppo.
    *   Salva e verifica che il cliente sia stato creato con il gruppo corretto.

#### 4. Fix Persistence Bundle (29/01/2026)
- [ ] **Esegui Migration**: Esegui il file SQL `supabase/migrations/20260129183000_fix_groups_bundles_constraint.sql` nel tuo database Supabase per aggiornare i vincoli di unicità (necessario per salvare i bundle correttamente).
- [ ] **Test Manuale**: Verifica che ora i bundle rimangano salvati e che puoi averne uno da "3 notti" in Bassa Stagione e uno da "3 notti" in Alta Stagione senza errori.

#### 5. Verifica Popup Riassunto Gruppi (29/01/2026)
- [ ] **Apertura Popup**: Vai in `Impostazioni > Gestione Gruppi` e clicca su una card qualsiasi (non sui bottoni modifica/elimina).
- [ ] **Contenuto**: Verifica che il popup mostri correttamente le tariffe per ogni stagione (Sconti, Prezzi Personalizzati, Bundle).
- [ ] **Bottoni Azione**: Verifica che cliccando sulla matita (Modifica) si apra il dialog di modifica e NON quello di riassunto. Idem per il cestino (Elimina).

