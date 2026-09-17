# MeteoCompare

## Stato attuale

### Funzionante

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
- Alias località (Pontecagnano Faiano)

### Backend

Produzione:
https://site--meteocompare-api--ddx7k442y97b.code.run

Locale:
http://10.0.2.2:3000

### Architettura

Android
↓
Northflank
↓
Express
↓
Forecast Aggregator
↓
iLMeteo + 3BMeteo

### Debito tecnico

#### Icone meteo da completare

Codici mancanti individuati:

- 44
- 45
- 47
- 48
- 54
- 60
- 61
- 103
- 104
- 105
- 108
- 109
- 110

Molti orari non mostrano l'icona.

#### Da valutare

Passaggio a icone statiche locali per:

- ridurre dipendenze esterne
- semplificare il mapping
- evitare problemi futuri
- migliorare performance

### UI

Completato:

- rimozione modalità Trioraria
- mantenuta solo vista Oraria

### Note sviluppo

Per test Android locale:

API_BASE_URL:

http://10.0.2.2:3000

Per produzione:

https://site--meteocompare-api--ddx7k442y97b.code.run
