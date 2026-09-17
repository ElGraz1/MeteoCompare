import {
  ilMeteoOggi,
  treBMeteoOggi,
  ilMeteoDomani,
  treBMeteoDomani,
  ilMeteoRomaOggi,
  treBMeteoRomaOggi,
} from "../data/mockForecasts";

import { getAggregatedForecast } from "./forecastAggregatorService";

import { searchCity } from "./ilMeteoService";

export async function getCityId(city: string) {
  const risultati = await searchCity(city);

  if (risultati.length === 0) {
    return null;
  }

  return risultati[0].id;
}

export async function getForecastsByCity(city: string, giorno: string) {
  const cityId = await getCityId(city);

  const risultato = await getAggregatedForecast(city.toLowerCase());

  return risultato;
}

export function buildComparison(ilMeteo: any[], treBMeteo: any[]) {
  return ilMeteo.map((ilMeteoItem) => {
    const treBMeteoItem = treBMeteo.find(
      (item) => item.ora === ilMeteoItem.ora,
    );

    const differenzaProbabilita = treBMeteoItem
      ? Math.abs(ilMeteoItem.probabilita - treBMeteoItem.probabilita)
      : 0;

    const differenzaAccumulo = treBMeteoItem
      ? Math.abs(ilMeteoItem.accumulo - treBMeteoItem.accumulo)
      : 0;

    return {
      ora: ilMeteoItem.ora,
      icona: ilMeteoItem.icona,
      ilMeteo: ilMeteoItem,
      treBMeteo: treBMeteoItem,
      alert: differenzaProbabilita > 20 || differenzaAccumulo > 3,
    };
  });
}

export function getForecasts(giorno: string) {
  const cityRaw = localStorage.getItem("city");

  const city = cityRaw ? JSON.parse(cityRaw) : null;

  const isRoma = city?.nome === "Roma";

  const dati =
    giorno === "Domani"
      ? {
          ilMeteo: ilMeteoDomani,
          treBMeteo: treBMeteoDomani,
        }
      : isRoma
        ? {
            ilMeteo: ilMeteoRomaOggi,
            treBMeteo: treBMeteoRomaOggi,
          }
        : {
            ilMeteo: ilMeteoOggi,
            treBMeteo: treBMeteoOggi,
          };

  return buildComparison(dati.ilMeteo, dati.treBMeteo);
}
