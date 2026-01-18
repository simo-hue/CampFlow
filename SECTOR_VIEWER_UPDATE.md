# Aggiornamento: Vista Occupazione per Settore

## 📋 Implementazione del 18/01/2026

### Modifica Richiesta
Invece della mappa interattiva SVG, è stato implementato un **Sector Occupancy Viewer** che permette di:
- Selezionare un settore di piazzole (6 settori da 50 piazzole ciascuno)
- Visualizzare lo stato di occupazione in una griglia a colpo d'occhio
- Vedere le prenotazioni per un range di date specifico

---

## 🆕 Componente Creato: SectorOccupancyViewer

**File**: `src/components/dashboard/SectorOccupancyViewer.tsx`

### Features Implementate

#### 1. **Selettore Settori** (6 bottoni)
```
Settore 1-50    | Piazzole 001-050
Settore 51-100  | Piazzole 051-100
Settore 101-150 | Piazzole 101-150
Settore 151-200 | Piazzole 151-200
Settore 201-250 | Piazzole 201-250
Settore 251-300 | Piazzole 251-300
```

#### 2. **Date Range Selector**
- **Data Inizio**: Input date picker
- **Data Fine**: Input date picker (minimo = data inizio)
- Default: Oggi + 7 giorni

#### 3. **Griglia Occupazione**
- **Layout**: Grid responsive (5 colonne mobile, 10 desktop)
- **Ogni piazzola mostra**:
  - Numero piazzola
  - Badge "Occupata" se prenotata
  - Colore di sfondo:
    - 🟢 **Verde**: Libera nel periodo
    - 🔴 **Rosso**: Occupata nel periodo

#### 4. **Dettagli al Click**
Cliccando su una piazzola appare un alert con:
- **Se occupata**:
  - Nome cliente
  - Data check-in
  - Data check-out
- **Se libera**:
  - Conferma disponibilità
  - Tipo piazzola

#### 5. **Riepilogo**
Box informativo che mostra:
- Totale piazzole libere nel settore
- Totale piazzole occupate nel settore

---

## 🔌 Nuove API Create

### 1. `GET /api/pitches/sector`

**Scopo**: Recuperare tutte le piazzole di un settore

**Query Parameters**:
- `min`: Numero minimo (es: 1)
- `max`: Numero massimo (es: 50)

**Response**:
```json
{
  "sector_range": { "min": 1, "max": 50 },
  "total_pitches": 15,
  "pitches": [...]
}
```

**Implementazione**:
- Genera numero piazzole con padding (001, 002, ...)
- Query con `IN` su array di numeri
- Ordinamento per numero

---

### 2. `GET /api/occupancy`

**Scopo**: Verificare se una piazzola è occupata in un range di date

**Query Parameters**:
- `pitch_id`: UUID della piazzola
- `check_in`: YYYY-MM-DD
- `check_out`: YYYY-MM-DD

**Response**:
```json
{
  "pitch_id": "uuid-here",
  "date_range": {
    "check_in": "2026-02-01",
    "check_out": "2026-02-10"
  },
  "is_occupied": true,
  "booking": {
    "customer_name": "Mario Rossi",
    "check_in": "2026-02-05",
    "check_out": "2026-02-12",
    "guests_count": 3
  }
}
```

**Logica**:
- Query con `overlaps` su `booking_period`
- Esclude prenotazioni cancellate
- Parse del formato TSRANGE per estrarre date

---

## 📊 Comportamento UI

### Workflow Utente

1. **Operatore reception seleziona settore**: Click su "Settore 1-50"
2. **Seleziona range date**: Esempio 01/03/2026 - 08/03/2026
3. **Visualizza griglia**: 
   - 15 piazzole (nel caso di test con solo 15 pitches seed)
   - Colorate verde/rosso
4. **Click su piazzola rossa** → Vede chi ha prenotato e quando
5. **Click su piazzola verde** → Conferma disponibilità

### Ottimizzazioni

- **Parallel API calls**: Usa `Promise.all()` per caricare occupazione di tutte le piazzole contemporaneamente
- **Loading state**: Skeleton grid durante caricamento
- **Auto-reload**: Si ricarica quando cambi settore o date (via `useEffect`)

---

## 🎨 Styling

### Color Scheme
```css
Piazzola Libera:
  bg-green-100 border-green-300
  hover:bg-green-200

Piazzola Occupata:
  bg-red-100 border-red-300
  hover:bg-red-200

Badge Occupata:
  variant="destructive"
```

### Responsive
- Mobile (< 768px): 5 colonne
- Desktop (>= 768px): 10 colonne
- Aspect ratio quadrato per ogni cella

---

## 🔄 Integrazione Dashboard

**File modificato**: `src/app/page.tsx`

```diff
- import { MapPlaceholder } from '@/components/dashboard/MapPlaceholder';
+ import { SectorOccupancyViewer } from '@/components/dashboard/SectorOccupancyViewer';

  <section className="grid gap-6 lg:grid-cols-2">
-   <MapPlaceholder />
+   <SectorOccupancyViewer />
    <TimelinePreview />
  </section>
```

---

## ✅ Vantaggi Rispetto a Mappa SVG

1. ✅ **Implementazione immediata**: Nessun design SVG necessario
2. ✅ **Performance**: Griglia HTML/CSS molto veloce
3. ✅ **Scalabile**: Facile aggiungere/rimuovere settori
4. ✅ **Responsive**: Si adatta automaticamente a mobile
5. ✅ **Informativo**: Colpo d'occhio immediato su disponibilità
6. ✅ **Interattivo**: Click per dettagli prenotazione

---

## 🚀 Come Testare

### Prerequisiti
1. Supabase configurato con schema.sql
2. Almeno 15 piazzole nel database (già seeded)
3. `.env.local` configurato
4. `npm run dev` in esecuzione

### Test Manuale

1. **Apri** `http://localhost:3000`
2. **Scroll** alla sezione "Vista Occupazione per Settore"
3. **Clicca** "Settore 1-50"
4. **Seleziona** date (es: oggi + 7 giorni)
5. **Osserva** griglia piazzole
6. **Clicca** su una piazzola verde → Alert "Libera"
7. **Crea** prenotazione tramite API o UI
8. **Ricarica** → Piazzola diventa rossa
9. **Clicca** su piazzola rossa → Vedi dettagli booking

### Test API con cURL

```bash
# Test sector pitches
curl "http://localhost:3000/api/pitches/sector?min=1&max=50"

# Test occupancy check
curl "http://localhost:3000/api/occupancy?pitch_id=<UUID>&check_in=2026-03-01&check_out=2026-03-10"
```

---

## 📝 File Modificati/Creati

### Nuovi File
1. ✅ `src/components/dashboard/SectorOccupancyViewer.tsx` (187 righe)
2. ✅ `src/app/api/pitches/sector/route.ts` (63 righe)
3. ✅ `src/app/api/occupancy/route.ts` (88 righe)

### File Modificati
1. ✅ `src/app/page.tsx` (import + component swap)
2. ✅ `task.md` (aggiunta Phase 6)

### File Non Più Usati
- ❌ `src/components/dashboard/MapPlaceholder.tsx` (può essere eliminato)

---

## 🔮 Future Enhancements

### Fase 2 (Opzionale)
- [ ] **Filtro per tipo**: Mostra solo standard/comfort/premium
- [ ] **Tooltip** invece di alert: Dettagli in hover
- [ ] **Modal prenotazione**: Click su piazzola verde → Form prenotazione
- [ ] **Calendario esteso**: Visualizzazione mensile con heatmap
- [ ] **Export PDF**: Stampa griglia occupazione
- [ ] **Multi-date view**: Vedere più giorni contemporaneamente (simile calendario hotel)

---

**Data implementazione**: 18 Gennaio 2026  
**Tempo implementazione**: ~30 minuti  
**Stato**: ✅ Completo e funzionante  
**Lint Status**: ✅ Passing (2 warning minori non bloccanti)
