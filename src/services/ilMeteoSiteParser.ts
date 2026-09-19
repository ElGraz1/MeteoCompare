import * as cheerio from "cheerio";
import type { ForecastItem } from "../types/ForecastItem";

function normalizeHour(hour: string): string {
  let value = Number.parseInt(hour, 10);

  if (!Number.isFinite(value)) {
    return "";
  }

  if (value === 24) {
    value = 0;
  }

  return `${String(value).padStart(2, "0")}:00`;
}

function extractNumber(value: string): number {
  const normalized = value.replace(",", ".").replace(/\u00a0/g, " ");

  const match = normalized.match(/-?\d+(?:\.\d+)?/);

  return match ? Number(match[0]) : 0;
}

function normalizeLabel(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function getValueByLabel(
  dialog: cheerio.Cheerio<any>,
  label: string,
  $: cheerio.CheerioAPI,
): string {
  const expectedLabel = normalizeLabel(label);
  let result = "";

  dialog.find(".data-row").each((_, row) => {
    const currentLabel = normalizeLabel($(row).find(".data-label").text());

    if (
      currentLabel === expectedLabel ||
      currentLabel.includes(expectedLabel)
    ) {
      result = $(row)
        .find(".data-value")
        .text()
        .replace(/\u00a0/g, " ")
        .replace(/\s+/g, " ")
        .trim();

      return false;
    }
  });

  return result;
}

export function parseIlMeteoHtml(html: string): ForecastItem[] {
  const $ = cheerio.load(html);
  const forecasts: ForecastItem[] = [];

  $("tr.forecast_1h").each((_, row) => {
    const currentRow = $(row);
    const cells = currentRow.find("td");
    const rawHour = cells.eq(0).text().trim();
    const dialogId = currentRow.attr("data-dialogid");

    if (!rawHour || !dialogId) {
      return;
    }

    const dialog = $(`#dialog-dettaglio-${dialogId}`);

    if (dialog.length === 0) {
      return;
    }

    const ora = normalizeHour(rawHour);

    if (!ora) {
      return;
    }

    const codiceIcona = Number(
      cells.eq(1).find("[data-simbolo]").attr("data-simbolo"),
    );

    const temperatura = extractNumber(
      getValueByLabel(dialog, "Temperatura", $),
    );

    const umidita = extractNumber(getValueByLabel(dialog, "Umidità rel.", $));

    const pressione = extractNumber(getValueByLabel(dialog, "Pressione", $));

    const probabilita = extractNumber(
      getValueByLabel(dialog, "Probabilità di precipitazione", $),
    );

    const accumulo = extractNumber(
      getValueByLabel(dialog, "Precipitazioni", $),
    );

    const grandine = extractNumber(getValueByLabel(dialog, "Grandine", $));

    const descrizione = dialog
      .find(".previ-descri")
      .first()
      .text()
      .replace(/\u00a0/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    forecasts.push({
      ora,
      codiceIcona: Number.isFinite(codiceIcona) ? codiceIcona : 0,
      temperatura,
      pressione,
      umidita,
      probabilita,
      descrizione,
      accumulo,
      grandine,
    });
  });

  return forecasts;
}

export async function getForecastFromSite(
  slug: string,
  day: number = 0,
): Promise<ForecastItem[]> {
  const normalizedSlug = slug.trim().toLowerCase();

  if (!normalizedSlug || !/^[a-z0-9+]+$/.test(normalizedSlug)) {
    throw new Error("Slug della località non valido");
  }

  let url = `https://www.ilmeteo.it/meteo/${normalizedSlug}`;

  if (day === 1) {
    url += "/domani";
  } else if (day === 2) {
    url += "/dopodomani";
  } else if (day >= 3) {
    url += `/${day}`;
  }

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Errore iLMeteo HTTP ${response.status}`);
  }

  const html = await response.text();
  const forecasts = parseIlMeteoHtml(html);

  if (forecasts.length === 0) {
    throw new Error(`Nessuna previsione oraria trovata per ${normalizedSlug}`);
  }

  if (day > 0) {
    const filtered: ForecastItem[] = [];

    let firstMidnightFound = false;

    for (const forecast of forecasts) {
      if (forecast.ora === "00:00") {
        if (firstMidnightFound) {
          break;
        }

        firstMidnightFound = true;
      }

      filtered.push(forecast);
    }

    return filtered;
  }

  const todayForecasts: ForecastItem[] = [];

  for (const forecast of forecasts) {
    if (forecast.ora === "00:00") {
      break;
    }

    todayForecasts.push(forecast);
  }

  return todayForecasts;
}
