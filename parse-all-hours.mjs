// parse-all-hours.mjs

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

import * as cheerio from "cheerio";

const response = await fetch(
  "https://www.ilmeteo.it/meteo/roma"
);

const html = await response.text();

const $ = cheerio.load(html);

const forecasts = [];

$("tr.forecast_1h").each((_, row) => {

  const td = $(row).find("td");

  forecasts.push({
    ora: $(td[0]).text().trim(),

    codiceIcona: Number(
      $(td[1])
        .find("[data-simbolo]")
        .attr("data-simbolo")
    ),

    temperatura: Number(
      $(td[2])
        .text()
        .trim()
        .replace(",", ".")
    ),

    descrizione: $(td[3])
      .text()
      .trim(),

    probabilita: Number(
      $(td[6])
        .text()
        .replace("%", "")
    ),

    percepita: Number(
      $(td[7])
        .text()
        .trim()
        .replace(",", ".")
    ),

    pressione: Number(
      $(td[8]).text()
    ),

    umidita: Number(
      $(td[9]).text()
    )
  });
});

console.log(
  JSON.stringify(
    forecasts,
    null,
    2
  )
);