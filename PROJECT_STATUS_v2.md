# MeteoCompare - Project Status

_Updated: 23 settembre 2026_

## 1. Panoramica

MeteoCompare è un'app React Native / Expo che confronta le previsioni orarie di **iLMeteo** e **3BMeteo** per le località italiane. Il backend Node.js / Express recupera, normalizza, confronta e mette in cache i dati dei due provider; il frontend mostra il confronto, le divergenze utili per l'utente e le impostazioni delle notifiche.

## 2. Versionamento e Git

- Branch di lavoro/stabile utilizzato: `backup-v0.1`
- Tag di sicurezza creato: `v0.1.3-pre`
- Tag/versione stabile successiva da definire dopo i test finali
- Repository remoto: `ElGraz1/MeteoCompare`
- Ultima build APK verificata: installata e funzionante
- `package.json`: versione applicativa attualmente indicata come `1.0.0`

> Prima del prossimo rilascio, allineare esplicitamente `version`, `android.versionCode`, tag Git e nome della release.

## 3. Architettura

```text
App Android / Expo Router
        ↓
apiForecastService.ts
        ↓
Backend Express su Northflank
        ↓
forecastAggregatorService.ts
        ↓
Cache in-memory, TTL 15 minuti
        ↓
ilMeteoSiteParser.ts + treBMeteoSiteParser.ts
```

### Backend di produzione

```text
https://site--meteocompare-api--ddx7k442y97b.code.run
```

### Backend locale per emulatore Android

```text
http://10.0.2.2:3000
```

## 4. Funzionalità completate

### Previsioni e confronto

- Ricerca località tramite suggerimenti iLMeteo
- Endpoint backend `/forecast/:city?day=N`
- Confronto orario iLMeteo / 3BMeteo
- Giorni disponibili: oggi e i sei giorni successivi
- Etichette giorno dinamiche
- Temperatura e icona per entrambi i provider
- Dettaglio espandibile di probabilità e accumulo
- Indicatori `▼` e `▲` per aprire/chiudere il dettaglio
- Loader mentre vengono recuperate le previsioni
- Cache backend in-memory con TTL di 15 minuti

### Località composte

La normalizzazione generale usa `+` tra le parole, supportato dagli URL di entrambi i provider.

Esempi verificati:

```text
San Giovanni in Fiore   → san+giovanni+in+fiore
Santa Maria Capua Vetere → santa+maria+capua+vetere
Pontecagnano Faiano     → pontecagnano+faiano
```

Gli alias hardcoded di Pontecagnano sono stati rimossi. Le località composte ora funzionano con una soluzione generale.

### Icone meteo

Sono presenti:

```text
☀️ sun
⛅ partlyCloudy
☁️ cloudy
🌦️ rainLight
🌧️ rain
⛈️ storm
🌨️ snow
🌫️ fog
💨 wind
```

Il mapping 3BMeteo è basato sulla descrizione testuale. È stato corretto il caso **"Pioggia e schiarite"**, che deve essere rappresentato con un'icona che includa il sole e la pioggia, non con la sola pioggia.

### Località preferita e onboarding

- Salvataggio della chiave `preferredCity` in AsyncStorage
- Caricamento automatico della località salvata all'avvio
- `LocationInput` sincronizzato con la prop `localita` tramite `useEffect`
- Popup di benvenuto al primo avvio se `preferredCity` non esiste
- Nel popup l'utente seleziona una località e preme **Inizia**
- La località viene salvata e vengono caricate le previsioni
- Alle aperture successive il popup non viene mostrato

> Per simulare il primo avvio, cancellare temporaneamente solo `preferredCity` da AsyncStorage oppure cancellare i dati dell'app. Non lasciare in produzione `AsyncStorage.removeItem("preferredCity")` dentro l'avvio.

## 5. Schermata Impostazioni

Route:

```text
src/app/settings.tsx
```

Impostazioni disponibili:

- Località preferita
- Attivazione/disattivazione notifiche
- Ora della notifica
- Probabilità minima
- Accumulo minimo
- Fonte notifica
- Inizio e fine delle ore critiche

### Valori predefiniti

```text
Ora notifica:        20:00
Probabilità minima:  60%
Accumulo minimo:     3 mm
Fonte:               Più prudente
Ore critiche:        07:00 → 20:00
```

### Fonte notifica

Valori persistiti:

```text
ilm   → iLMeteo
3bm   → 3BMeteo
both  → Entrambi
max   → Più prudente
```

Significato:

- `ilm`: usa solo iLMeteo
- `3bm`: usa solo 3BMeteo
- `both`: consenso tra i provider, tramite il valore minimo per probabilità e accumulo
- `max`: criterio prudente, tramite il valore massimo per probabilità e accumulo

Sono presenti pagine informative dedicate:

```text
provider-info.tsx
probability-info.tsx
accumulation-info.tsx
```

## 6. Motore notifiche

### File principali

```text
src/services/notificationEvaluator.ts
src/services/buildNotificationMessage.ts
src/services/notificationSettingsService.ts
src/services/forecastNotificationAdapter.ts
src/services/notificationService.ts
src/services/localNotificationService.ts
src/app/notification-details.tsx
```

### Pipeline

```text
AsyncStorage
    ↓
loadNotificationSettings()
    ↓
getForecastsByCity(località, 1)
    ↓
toNotificationForecast(data.confronto)
    ↓
evaluateNotification()
    ↓
buildNotificationMessage()
    ↓
showLocalNotification()
```

### Valutazione delle quattro modalità

- `ilm`: usa probabilità e accumulo iLMeteo
- `3bm`: usa probabilità e accumulo 3BMeteo
- `both`: usa `min(iLMeteo, 3BMeteo)` per rappresentare il consenso
- `max`: usa `max(iLMeteo, 3BMeteo)` come valore più prudente

Il motore:

- filtra le previsioni nelle ore critiche
- calcola probabilità massima e accumulo massimo
- decide se notificare in base alle soglie
- individua la prima e l'ultima ora interessata
- restituisce anche `providerUsed`

### Stato notifiche Android

- La notifica locale reale è stata verificata nell'APK ed è funzionante
- Il pulsante **Simula notifica** usa dati reali e impostazioni reali
- È presente una pagina `notification-details.tsx`
- Il payload previsto contiene:

```text
city
startHour
endHour
probability
accumulation
provider
```

### Limitazione Expo Go

Con Expo Go e SDK 53+ l'import di `expo-notifications` provoca errore. Per questo:

- in Expo Go, usare temporaneamente `Alert.alert()` e non importare direttamente o indirettamente `expo-notifications`
- nell'APK / development build, riattivare `localNotificationService` e il listener del tap in `_layout.tsx`

Prima di una build APK con notifiche, ripristinare:

- import di `expo-notifications`
- richiesta permessi
- `showLocalNotification()`
- listener `addNotificationResponseReceivedListener()` in `_layout.tsx`

## 7. Nuova logica del triangolo di divergenza ⚠️

### Principio approvato

Il triangolo non evidenzia semplici differenze numeriche. Evidenzia differenze che possono portare l'utente a prendere decisioni diverse.

### Probabilità

Regola definitiva approvata:

```text
0-49%   → non considero la pioggia
50-100% → considero la pioggia
```

Il 50% appartiene alla fascia superiore.

Funzione prevista:

```ts
function getProbabilityBehavior(probability: number) {
  return probability >= 50
    ? "consider-rain"
    : "ignore-rain";
}
```

Casi approvati:

```text
10% vs 30% → no alert
0%  vs 35% → no alert
40% vs 49% → no alert
60% vs 90% → no alert
10% vs 50% → alert
39% vs 61% → alert
20% vs 70% → alert
0%  vs 100% → alert
```

### Accumulo

Classi comportamentali attuali:

```text
0 - 0,5 mm  → dry
>0,5 - 2 mm → negligible
>2 - 10 mm  → umbrella
>10 mm      → mobility-impact
```

Funzione prevista:

```ts
function getAccumulationBehavior(accumulation: number) {
  if (accumulation <= 0.5) return "dry";
  if (accumulation <= 2) return "negligible";
  if (accumulation <= 10) return "umbrella";
  return "mobility-impact";
}
```

Casi approvati:

```text
0 mm  vs 0,3 mm → no alert
5 mm  vs 8 mm   → no alert
15 mm vs 20 mm  → no alert
0 mm  vs 3 mm   → alert
1 mm  vs 5 mm   → alert
5 mm  vs 15 mm  → alert
2 mm  vs 20 mm  → alert
```

### Punto di modifica backend

File:

```text
src/services/forecastAggregatorService.ts
```

Vecchia logica:

```ts
const alert =
  differenzaProbabilita > 20 ||
  differenzaAccumulo > 3;
```

Nuova logica:

```ts
const probabilityAlert = hasProbabilityAlert(
  ilMeteo.probabilita,
  treBMeteo.probabilita,
);

const accumulationAlert = hasAccumulationAlert(
  ilMeteo.accumulo,
  treBMeteo.accumulo,
);

const alert = probabilityAlert || accumulationAlert;
```

### Attenzione sul deploy

`forecastAggregatorService.ts` gira nel backend. L'app punta al backend remoto di Northflank. Le modifiche locali non si vedono nell'app finché non vengono eseguiti commit, push e deploy del backend.

Prima del push, assicurarsi di aver rimosso il test:

```ts
const alert = false;
```

Ripristinare:

```ts
const alert = probabilityAlert || accumulationAlert;
```

Dopo il deploy, tenere conto della cache server-side di 15 minuti oppure riavviare il servizio / invalidare la cache per verificare subito la nuova logica.

## 8. Freccia di espansione

La freccia viene mostrata quando almeno uno dei provider ha probabilità o accumulo maggiori di zero.

```text
▼ dettaglio chiuso
▲ dettaglio aperto
```

Il triangolo ⚠️ è indipendente dalla freccia e rappresenta la divergenza decisionale tra provider.

## 9. Stato Expo / EAS

Dipendenze Expo allineate:

```text
@expo/ui          ~57.0.19
expo              ~57.0.24
expo-router       ~57.0.22
expo-notifications ~57.0.20
```

È stato rimosso dallo script `package.json` il comando conflittuale:

```json
"expo": "expo start"
```

Build APK:

```bash
npx eas build -p android --profile preview
```

La build APK è stata completata e installata con successo.

## 10. Pulizia tecnica consigliata

- Rimuovere i log temporanei `[ALERT]`, `[BUILD FORECAST COMPARISON]`, `[3BM ICON]` dopo la validazione
- Verificare che non sia presente `const alert = false`
- Verificare che `AsyncStorage.removeItem("preferredCity")` non resti nel codice di produzione
- Rimuovere eventuali file e pulsanti di test non più necessari
- Evitare `Pressable` annidati
- Mantenere un solo `useEffect` per caricare `preferredCity`
- Valutare la rimozione di `getFallbackCities()` se non più usato
- Eliminare il blocco vuoto:

```ts
if (cityToSearch !== slug.toLowerCase()) {
}
```

## 11. Prossimi passi prioritari

1. Ripristinare la formula definitiva `const alert = probabilityAlert || accumulationAlert`
2. Fare commit e push della nuova logica alert
3. Attendere il deploy Northflank
4. Invalidare o attendere la cache e verificare i casi reali
5. Validare le classi accumulo su più città e giorni
6. Ripristinare il flusso notifiche native nella prossima APK
7. Verificare il tap sulla notifica e l'apertura di `notification-details`
8. Progettare l'esecuzione automatica delle notifiche all'ora scelta

## 12. Comandi utili

### Avvio Expo

```bash
npx expo start --clear
```

### Controllo dipendenze Expo

```bash
npx expo install --check
```

### Build APK

```bash
npx eas build -p android --profile preview
```

### Git

```bash
git status
git add .
git commit -m "feat: behavioral forecast divergence alerts"
git push
```

---

## Contesto da usare nella prossima chat

Continuare dalla nuova logica del triangolo ⚠️. La probabilità è definita definitivamente con soglia inclusiva al 50%. L'accumulo usa classi comportamentali basate sull'impatto sugli spostamenti. Prima del deploy controllare che non sia rimasto `const alert = false`. Dopo il push, validare la risposta del backend remoto e tenere conto della cache di 15 minuti.
