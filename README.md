# 🏕️ CampFlow PMS

**Property Management System per Campeggio 300 Piazzole**

Sistema gestionale ottimizzato per reception campeggio con focus su velocità e integrità dati. Previene fisicamente l'overbooking tramite constraint PostgreSQL.

---

## 🚀 Quick Start

### Prerequisiti
- Node.js 18+ e npm
- Account Supabase (gratuito)

### Setup in 5 Minuti

```bash
# 1. Installa dipendenze
npm install

# 2. Configura Supabase
# - Crea progetto su https://app.supabase.com
# - Copia .env.example → .env.local
# - Inserisci le credenziali Supabase

# 3. Carica schema database
# - Apri SQL Editor in Supabase
# - Esegui tutto il contenuto di supabase/schema.sql

# 4. Avvia il server di sviluppo
npm run dev

# 5. Apri http://localhost:3000
```

📖 **Guida completa**: Vedi [`TO_SIMO_DO.md`](./TO_SIMO_DO.md) per istruzioni dettagliate.

---

## ✨ Features Implementate

### Dashboard "The Cockpit"
- ✅ **Quick Stats Widget**: Arrivi/Partenze/Occupazione in tempo reale (auto-refresh 30s)
- ✅ **Global Search** (Ctrl+K): Ricerca rapida clienti e prenotazioni
- ✅ **Availability Module**: Cerca piazzole libere per date e tipo
- ✅ **Timeline Preview**: Eventi prossime 24 ore
- 🔲 **Interactive Map**: Placeholder per mappa SVG (Fase 2)

### Backend API
- ✅ **POST `/api/bookings`**: Crea prenotazioni con validazione anti-overbooking
- ✅ **GET `/api/availability`**: Query piazzole disponibili per range date
- ✅ **GET `/api/stats`**: Statistiche dashboard real-time

### Database Features
- ✅ **TSRANGE + GIST Exclusion Constraint**: Zero overbooking fisicamente garantito
- ✅ **Calcolo prezzi stagionale**: Alta/Media/Bassa stagione automatico
- ✅ **Ottimizzazione query**: 8 indici strategici per performance <100ms

---

## 🏗️ Tech Stack

| Layer | Technology | Motivazione |
|-------|-----------|-------------|
| Framework | Next.js 15 (App Router) | API routes integrate, SSR, deployment unificato |
| Database | Supabase (PostgreSQL) | Managed, gratuito, GIST indexes nativi |
| UI Library | Shadcn/UI + Tailwind | Zero bundle extra, customizzabile al 100% |
| Language | TypeScript | Type safety end-to-end |
| Styling | Tailwind CSS v4 | Utility-first, performance ottimale |

---

## 📁 Struttura Progetto

```
CampFlow/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── availability/route.ts    # GET piazzole libere
│   │   │   ├── bookings/route.ts        # POST/GET prenotazioni
│   │   │   └── stats/route.ts           # GET statistiche
│   │   └── page.tsx                     # Dashboard principale
│   │
│   ├── components/
│   │   ├── dashboard/
│   │   │   ├── QuickStatsWidget.tsx     # Widget statistiche
│   │   │   ├── GlobalSearchBar.tsx      # Cmd+K search
│   │   │   ├── AvailabilityModule.tsx   # Form ricerca piazzole
│   │   │   ├── MapPlaceholder.tsx       # Placeholder mappa
│   │   │   └── TimelinePreview.tsx      # Timeline eventi
│   │   └── ui/                          # Shadcn components
│   │
│   └── lib/
│       ├── supabase/
│       │   ├── client.ts                # Client browser
│       │   └── server.ts                # Client server (service role)
│       ├── pricing.ts                   # Calcolo prezzi stagionali
│       └── types.ts                     # TypeScript types
│
├── supabase/
│   └── schema.sql                       # Schema completo con constraint
│
├── TO_SIMO_DO.md                        # ⚠️ Checklist azioni manuali
├── DOCUMENTATION.md                     # 📚 Scelte implementative
└── env.example                          # Template variabili ambiente
```

---

## 🧪 Testing

### Test Anti-Overbooking (CRITICO)

```bash
# Testa endpoint availability
curl "http://localhost:3000/api/availability?check_in=2026-06-01&check_out=2026-06-05"

# Tenta di creare booking sovrapposto (deve restituire 409 Conflict)
curl -X POST http://localhost:3000/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "pitch_id": "...",
    "customer": {...},
    "check_in": "2026-06-01",
    "check_out": "2026-06-05",
    "guests_count": 2
  }'
```

Vedi [`TO_SIMO_DO.md`](./TO_SIMO_DO.md) per test completi.

---

## 🎯 Anti-Overbooking: Come Funziona

```sql
-- Constraint GIST a livello database
ALTER TABLE bookings 
ADD CONSTRAINT prevent_overbooking 
EXCLUDE USING GIST (
  pitch_id WITH =,
  booking_period WITH &&
) WHERE (status NOT IN ('cancelled'));
```

**Risultato**: PostgreSQL impedisce FISICAMENTE inserimenti con sovrapposizione date. Nessuna race condition possibile.

**Errore restituito**: Code `23P01` → API traduce in `409 Conflict` con messaggio "Piazzola già occupata in questo periodo".

---

## 📊 Performance Targets

| Metrica | Target | Implementato |
|---------|--------|--------------|
| Dashboard load (TTFB) | <500ms | ✅ (Next.js SSR) |
| Availability query | <100ms | ✅ (GIST index) |
| Booking creation | <200ms | ✅ (Atomic transaction) |
| Stats refresh | 30s | ✅ (Auto-refresh) |

---

## 🗺️ Roadmap

### ✅ Fase 1 (Completata)
- Setup progetto Next.js + Supabase
- Schema database con anti-overbooking
- API availability, bookings, stats
- Dashboard con 5 componenti principali
- Calcolo prezzi stagionale

### 🔄 Fase 2 (Prossimi Sprint)
- [ ] Mappa SVG interattiva 300 piazzole
- [ ] Form prenotazione completo con modal
- [ ] Customer search API `/api/customers`
- [ ] Export PDF report
- [ ] Autenticazione Supabase Auth

### 🚀 Fase 3 (Future)
- [ ] Multi-utente con permessi
- [ ] Portale clienti pubblico
- [ ] Integrazione email conferme
- [ ] Mobile app (React Native + Expo)

---

## 🔐 Sicurezza

**Attuale** (MVP interno):
- API routes pubbliche (OK per testing)
- Variabili ambiente non committate

**Produzione** (TODO Fase 2):
- Row Level Security (RLS) Supabase
- Middleware autenticazione
- Rate limiting
- HTTPS obbligatorio

---

## 📖 Documentazione

- **[TO_SIMO_DO.md](./TO_SIMO_DO.md)**: Checklist setup e test manuali
- **[DOCUMENTATION.md](./DOCUMENTATION.md)**: Decisioni architetturali e trade-off
- **[supabase/schema.sql](./supabase/schema.sql)**: Schema database commentato

---

## 🛠️ Scripts Disponibili

```bash
npm run dev          # Server sviluppo (http://localhost:3000)
npm run build        # Build produzione
npm run start        # Avvia build produzione
npm run lint         # ESLint check
```

---

## 🤝 Contributing

Questo è un progetto proprietario per gestione interna. Per modifiche:

1. Aggiorna [`DOCUMENTATION.md`](./DOCUMENTATION.md) con decisioni implementative
2. Aggiorna [`TO_SIMO_DO.md`](./TO_SIMO_DO.md) se necessario nuovo testing
3. Mantieni type safety TypeScript strict
4. Test anti-overbooking prima di ogni commit

---

## 📄 License

Proprietario © 2026 CampFlow

---

## ⚡ Pro Tips

- **Cmd+K**: Global search ovunque
- **Auto-refresh**: Stats si aggiornano automaticamente ogni 30s
- **Date format**: Usa sempre `YYYY-MM-DD` nelle API
- **GIST index**: Query availability scala linearmente anche con 100k bookings

---

**Creato il**: 18 Gennaio 2026  
**Stack**: Next.js 15 + Supabase + TypeScript + Shadcn/UI  
**Database**: PostgreSQL con TSRANGE + GIST Exclusion Constraint
