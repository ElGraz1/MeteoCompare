process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

import {
  getForecastFrom3BMeteo,
} from "./src/services/treBMeteoSiteParser";

async function main() {

  const cities = [
    "roma",
    "milano",
    "genova",
    "napoli",
    "torino",
  ];

  for (const city of cities) {

    console.log("\n");
    console.log("==============");
    console.log(city.toUpperCase());
    console.log("==============");

    const forecasts =
      await getForecastFrom3BMeteo(
        city
      );

    console.log(
      "Righe trovate:",
      forecasts.length
    );

    console.log(
      "Prima riga:"
    );

    console.log(
      forecasts[0]
    );

    console.log(
      "Ultima riga:"
    );

    console.log(
      forecasts[
        forecasts.length - 1
      ]
    );

  }

}

main().catch(console.error);