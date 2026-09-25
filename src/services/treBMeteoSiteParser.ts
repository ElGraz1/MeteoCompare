import * as cheerio from "cheerio";
import type { ForecastItem } from "../types/ForecastItem";

function normalizeHour(value: string): string {
  const hour = Number.parseInt(value.trim(), 10);

  if (!Number.isFinite(hour)) {
    return "";
  }

  return String(hour).padStart(2, "0") + ":00";
}

function extractNumber(value: string): number {
  const normalized = value.replace(",", ".");

  const match = normalized.match(/(\d+(?:\.\d+)?)/i);

  return match ? Number(match[1]) : 0;
}

function getParamValue(
  item: cheerio.Cheerio<any>,
  param: string,
  $: cheerio.CheerioAPI,
): string {
  return item
    .find(`[data-param="${param}"] .ds-label-medium`)
    .first()
    .text()
    .trim();
}

function extractIconCode(
  item: cheerio.Cheerio<any>,
  $: cheerio.CheerioAPI,
): number {
  const images = item.find("img").toArray();

  for (const image of images) {
    const src = $(image).attr("src") || "";

    const match = src.match(/\/(\d+)\.svg(?:\?|$)/i);

    if (match) {
      return Number(match[1]);
    }
  }

  return 0;
}

export function parseTreBMeteoHtml(html: string): ForecastItem[] {
  const $ = cheerio.load(html);

  const forecasts: ForecastItem[] = [];

  $("li.fc-accordion-item").each((_, element) => {
    const item = $(element);

    const ora = normalizeHour(item.find(".ds-forecast-time").first().text());

    if (!ora) {
      return;
    }

    const codiceIcona = extractIconCode(item, $);

    const temperatura = Number(
      item.find(".unit-temp[data-temp-c]").first().attr("data-temp-c") || "0",
    );

    const descrizione = item.find(".unit-tempo").first().text().trim();

    const probabilita = extractNumber(getParamValue(item, "probabilita", $));

    const umidita = extractNumber(getParamValue(item, "umidita", $));

    const pressione = extractNumber(getParamValue(item, "pressione", $));

    const accumulo = extractNumber(getParamValue(item, "precipitazioni", $));

    forecasts.push({
      ora,
      codiceIcona,
      temperatura,
      pressione,
      umidita,
      probabilita,
      descrizione,
      accumulo,
      grandine: 0,
    });
  });

  return forecasts;
}

export async function getForecastFrom3BMeteo(
  slug: string,
  day: number = 0,
): Promise<ForecastItem[]> {
  const normalizedSlug = slug.trim().toLowerCase();

  let url = `https://www.3bmeteo.com/meteo/${normalizedSlug}`;

  if (day > 0) {
    url += `/${day}`;
  }

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Errore HTTP ${response.status}`);
  }

  const html = await response.text();

  const forecasts = parseTreBMeteoHtml(html);

  if (forecasts.length === 0) {
    throw new Error(`Nessuna previsione trovata per ${normalizedSlug}`);
  }

  return forecasts;
}
