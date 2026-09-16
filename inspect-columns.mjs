// inspect-columns.mjs

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

import * as cheerio from "cheerio";

const response = await fetch(
  "https://www.ilmeteo.it/meteo/roma"
);

const html = await response.text();

const $ = cheerio.load(html);

const row = $("tr.forecast_1h").first();

row.find("td").each((i, td) => {
  console.log(
    "\nCOLONNA",
    i
  );

  console.log(
    $(td).text().trim()
  );
});