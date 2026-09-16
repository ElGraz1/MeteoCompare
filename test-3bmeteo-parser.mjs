process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

import * as cheerio from "cheerio";

function normalizeHour(value) {

  const hour =
    parseInt(value.trim(), 10);

  if (!Number.isFinite(hour)) {
    return "";
  }

  return (
    String(hour).padStart(2, "0") +
    ":00"
  );
}

function extractNumber(value) {

  const match =
    value.match(
      /(\d+(?:\.\d+)?)/i
    );

  return match
    ? Number(match[1])
    : 0;
}

const response =
  await fetch(
    "https://www.3bmeteo.com/meteo/genova"
  );

const html =
  await response.text();

const $ =
  cheerio.load(html);

const forecasts = [];

$("li.fc-accordion-item").each(
  (_, element) => {

    const item =
      $(element);

    const ora =
      normalizeHour(
        item
          .find(".ds-forecast-time")
          .first()
          .text()
      );

    if (!ora) {
      return;
    }

    const iconSrc =
      item
        .find("img")
        .first()
        .attr("src") || "";

    const iconMatch =
      iconSrc.match(
        /\/(\d+)\.svg$/i
      );

    const codiceIcona =
      iconMatch
        ? Number(iconMatch[1])
        : 0;

    const descrizione =
      item
        .find(".unit-tempo")
        .first()
        .text()
        .trim();

    const temperatura =
      Number(
        item
          .find(
            ".unit-temp[data-temp-c]"
          )
          .first()
          .attr("data-temp-c")
      );

    const probabilita =
      extractNumber(
        item
          .find(
            '[data-param="probabilita"] .ds-label-medium'
          )
          .text()
      );

    const umidita =
      extractNumber(
        item
          .find(
            '[data-param="umidita"] .ds-label-medium'
          )
          .text()
      );

    const pressione =
      extractNumber(
        item
          .find(
            '[data-param="pressione"] .ds-label-medium'
          )
          .text()
      );

    const accumulo =
      extractNumber(
        item
          .find(
            '[data-param="precipitazioni"] .ds-label-medium'
          )
          .text()
      );

    forecasts.push({
      ora,
      codiceIcona,
      temperatura,
      pressione,
      umidita,
      probabilita,
      descrizione,
      accumulo,
      grandine: 0
    });

  }
);

console.log(
  forecasts[0]
);

console.log(
  JSON.stringify(
    forecasts,
    null,
    2
  )
);