// inspect-row-html.mjs

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

import * as cheerio from "cheerio";

const response = await fetch(
  "https://www.ilmeteo.it/meteo/roma"
);

const html = await response.text();

const $ = cheerio.load(html);

console.log(
  $.html(
    $("tr.forecast_1h").first()
  )
);