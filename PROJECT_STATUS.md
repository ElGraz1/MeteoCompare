# MeteoCompare

## Versione

**v0.1.1**

---

## Stato Attuale

### ✅ Completato

- Ricerca località tramite iLMeteo
- Backend Express
- Deploy Northflank
- Endpoint Health
- Endpoint Forecast
- Confronto iLMeteo / 3BMeteo
- Oggi
- Domani
- +2
- +3
- +4
- +5
- +6
- Alias località (Pontecagnano Faiano → Pontecagnano)
- Layout comparativo provider
- Alert differenze ⚠️
- Espansione dettagli ▼ ▲
- Cache server-side

---

## Backend

### Produzione

`https://site--meteocompare-api--ddx7k442y97b.code.run`

### Locale

`http://10.0.2.2:3000`

### Cache

#### Stato

Implementata e verificata.

#### Parametri

- Tipo: In-Memory Cache
- TTL: 15 minuti

#### Chiavi cache

Esempi:

- milano-0
- milano-1
- roma-0
- napoli-3

#### Comportamento

Prima richiesta:

```text
[CACHE MISS] milano-0
```

Richieste successive:

```text
[CACHE HIT] milano-0
```

#### Benefici

- Riduzione richieste verso iLMeteo
- Riduzione richieste verso 3BMeteo
- Miglioramento tempi di risposta
- Riduzione carico di scraping

---

## Architettura

```text
Android
   ↓
Northflank
   ↓
Express
   ↓
Forecast Aggregator
   ↓
Cache (15 min)
   ↓
iLMeteo + 3BMeteo
```

---

## UI

### Layout

```text
Ora | iLM | 3bM
```

### Completato

- Vista comparativa provider
- Temperatura per provider
- Icone per entrambi i provider
- Alert differenze ⚠️
- Espansione dettagli ▼ ▲
- Vista esclusivamente oraria
- Rimossa modalità trioraria

---

## Mapping Meteo

### Implementato

- WeatherType
- weatherIcons
- mapIlMeteoCode()
- map3BMeteoDescription()

### Stato attuale

Le icone vengono gestite lato app tramite emoji.

```text
☀️ Sole
⛅ Poco nuvoloso
☁️ Nuvoloso
🌦️ Pioggia debole
🌧️ Pioggia
⛈️ Temporale
🌨️ Neve
🌫️ Nebbia
💨 Vento
```

### Vantaggi

- Nessuna immagine scaricata dal backend
- Nessun traffico dati per le icone
- Possibile sostituzione futura con SVG locali

---

## Matching Località

### Attualmente gestito

- Pontecagnano Faiano → Pontecagnano

### Da migliorare

- Matching automatico tra località iLMeteo e 3BMeteo
- Gestione alias provider-specifici
- Gestione nomi con trattini
- Gestione apostrofi
- Gestione varianti di denominazione

---

## Debito Tecnico

### Parser 3BMeteo

Da verificare:

```text
codiceIcona = 0
```

per alcune condizioni meteo:

- nuvoloso
- molto nuvoloso

Possibile causa:

```text
extractIconCode()
```

---

## Asset Grafici

### Stato attuale

- Emoji come placeholder

### Evoluzione prevista

- SVG locali
- Nessuna dipendenza da asset provider
- Migliore qualità grafica
- Riduzione peso APK

---

## Cache Smartphone

Non implementata.

### Possibili sviluppi

- AsyncStorage
- Ultima previsione disponibile offline
- Apertura immediata dell'app
- Refresh automatico in background

---

## Analisi TLS

### Verifiche eseguite

- Nessuna evidenza nel codice MeteoCompare
- Nessuna variabile di ambiente anomala
- Origine riconducibile a dipendenze Expo

### Stato

Nessuna azione richiesta.

---

## Backlog

### Alta Priorità

- Matching intelligente località iLMeteo ↔ 3BMeteo
- Correzione completa extractIconCode() 3BMeteo

### Media Priorità

- SVG locali al posto delle emoji
- Cache locale smartphone

### Bassa Priorità

- Rifinitura posizione ▼ ⚠️

---

## Git

### Branch

```text
backup-v0.1
```

### Ultimo commit stabile

```text
7f8d163
```

### Include

- UI comparativa provider
- Mapping meteo
- Cache server-side
- Migliorie layout

---

## Prossimo Obiettivo

### v0.1 APK

- Generazione primo APK installabile
- Test su dispositivo reale
- Verifica performance
- Verifica UX
- Verifica comportamento cache