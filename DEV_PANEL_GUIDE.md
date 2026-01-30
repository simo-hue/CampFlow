# 🚀 Developer Panel - Quick Start Guide

## What You Just Got

Un pannello sviluppatore **professionale e completo** integrato nelle impostazioni, con:

### 📊 **Database Analytics**
- Visualizzazione real-time dello spazio occupato
- Breakdown dettagliato per tabella (row + size + indici)
- Percentuale utilizzo con warning colorati
- Proiezioni storage future

### 📝 **Log Management**
- Viewer real-time dei log applicazione
- Filtri per livello (INFO/WARN/ERROR)
- Metadata JSON espanso
- Cleanup automatico con un click

### ⚡ **Performance Monitoring**
- Connessioni attive al database
- Cache hit ratio (efficienza)
- Metriche aggregate

### 🛠️ **Maintenance Tools**
- Cleanup logs vecchi (1 click)
- VACUUM database ottimizzazione
- Guide best practices integrate

---

## ⚠️ **IMPORTANTE: Prima di Usarlo**

### Step 1: Esegui la Migrazione SQL

**Opzione A - Supabase Dashboard** (raccomandata):
1. Vai su https://supabase.com/dashboard
2. Apri il tuo progetto CampFlow
3. Sidebar: `SQL Editor`
4. Copia **TUTTO** il contenuto da:
   ```
   /Users/simo/Downloads/DEV/CampFlow/supabase/migrations/incremental/20260130_dev_panel_functions.sql
   ```
5. Incolla nell'editor e clicca **RUN**
6. Se vedi "Success", sei a posto ✅

**Opzione B - Supabase CLI** (se installato):
```bash
cd /Users/simo/Downloads/DEV/CampFlow
supabase db push
```

---

## 🎯 Come Usarlo

### 1. Apri il Pannello
1. Vai su `/settings`
2. Clicca **"Dev"** nella sidebar (icona Terminal 💻)
3. Vedrai immediatamente le statistiche caricate

### 2. Esplora le Tabs

#### Tab "Tables" 📋
- Vedi tutte le tabelle ordinate per dimensione
- `booking_guests` sarà la più grande (~70% del DB)
- Ogni riga mostra: nome, righe, dimensione totale, dimensione indici

#### Tab "Logs" 📝
- Clicca sui filtri: ALL / INFO / WARN / ERROR
- Ogni log mostra:
  - Icona colorata per livello
  - Timestamp in formato italiano
  - Messaggio
  - Metadata JSON (se presente)

#### Tab "Maintenance" 🛠️
- **Cleanup Logs**: Elimina log più vecchi di 60 giorni
- **Optimize Database**: Esegui VACUUM (libera spazio)
- **Best Practices**: Suggerimenti sempre visibili

---

## 💡 Quando Usarlo

### 📅 **Ogni Settimana**
- Controlla percentuale storage (deve stare < 80%)
- Verifica errors nei log (tab Logs → Filter ERROR)

### 📆 **Ogni Mese**
- Cleanup logs vecchi
- Run VACUUM se hai eliminato molti dati

### 🚨 **Se Storage > 80%**
1. Vai su Maintenance
2. Cleanup Old Logs
3. Run Optimize Database
4. Considera archiviare booking vecchi

---

## 🎨 Features Visive Premium

### Storage Bar
- 🟢 Verde: < 50% (tutto ok)
- 🟡 Giallo: 50-80% (monitorare)
- 🔴 Rosso: > 80% (azione richiesta!)

### Performance Cards
- Connessioni attive (dovrebbe essere basso, 1-3)
- Cache hit ratio (target: > 90%)
- Record totali (cresce nel tempo)

### Animazioni
- Spinner durante refresh
- Toast notifications per azioni
- Smooth transitions

---

## 🔒 Sicurezza

- ✅ Richiede autenticazione Supabase
- ✅ Funzioni SQL con SECURITY DEFINER
- ✅ Tutte le azioni sono logged
- ✅ Conferme per azioni distruttive

---

## 🆘 Troubleshooting

### "Failed to fetch database statistics"
→ Non hai eseguito la migrazione SQL. Torna allo Step 1.

### "Function get_database_stats does not exist"
→ La migrazione non è stata eseguita correttamente. Riprova.

### Storage troppo alto?
1. Vai su Tab Maintenance
2. Click "Cleanup Old Logs"
3. Se ancora alto, considera:
   - Eliminare booking test vecchi
   - Archiviare dati storici

---

## 📈 Metriche Tipiche (Riferimento)

### Storage dopo 1 anno (uso normale)
- **Totale**: ~40-60 MB
- **booking_guests**: ~30 MB (70%)
- **bookings**: ~5 MB (10%)
- **app_logs**: ~5 MB (10%)
- **Altri**: ~5 MB (10%)

### Cache Hit Ratio
- **Eccellente**: > 95%
- **Buono**: 90-95%
- **Da migliorare**: < 90%

---

## 🎉 Goditi il tuo Dev Panel!

Hai ora uno strumento **enterprise-grade** per monitorare e mantenere il tuo database.

**Domande? Bug? Idee?**  
Tutto è documentato in `DOCUMENTATION.md`
