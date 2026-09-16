process.env.NODE_TLS_REJECT_UNAUTHORIZED =
  "0";

import {
  getAggregatedForecast,
} from "./src/services/forecastAggregatorService";

async function main() {

  const risultato =
    await getAggregatedForecast(
      "genova"
    );

  console.log(
    "Località:",
    risultato.localita
  );

  console.log(
    "Righe iLMeteo:",
    risultato.ilMeteo.length
  );

  console.log(
    "Righe 3BMeteo:",
    risultato.treBMeteo.length
  );

  console.log(
    "Righe confronto:",
    risultato.confronto.length
  );

  const oreComuni =
    risultato.confronto.filter(
      (item) =>
        item.ilMeteo !== null &&
        item.treBMeteo !== null
    );

  console.log(
    "Ore comuni:",
    oreComuni.length
  );

  console.log(
    "Primo confronto:"
  );

  console.log(
    oreComuni[0]
  );

  console.log(
    "Alert trovati:"
  );

  console.log(
    risultato.confronto.filter(
      (item) => item.alert
    )
  );

}

main().catch(
  console.error
);