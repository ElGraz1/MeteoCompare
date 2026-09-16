// inspect-forecast-rows.mjs

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

import * as cheerio from "cheerio";

const response = await fetch(
  "https://www.ilmeteo.it/meteo/roma"
);

const html = await response.text();

const $ = cheerio.load(html);

console.log(
  "forecast_1h:",
  $("tr.forecast_1h").length
);

console.log(
  "forecast_3h:",
  $("tr.forecast_3h").length
);

if ($("tr.forecast_1h").length > 0) {
  console.log(
    $.html(
      $("tr.forecast_1h").first()
    ).substring(0, 1500)
  );
}