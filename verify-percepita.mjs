process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

import * as cheerio from "cheerio";

const cities = [
  "roma",
  "milano",
  "genova",
  "napoli",
  "torino"
];

for (const city of cities) {

  const response = await fetch(
    `https://www.ilmeteo.it/meteo/${city}`
  );

  const html = await response.text();

  const $ = cheerio.load(html);

  const row =
    $("tr.forecast_1h").last();

  const td =
    row.find("td");

  console.log(
    city,
    "td[11]=",
    $(td[11]).text().trim()
  );
}