// inspect-scripts.mjs

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

import * as cheerio from "cheerio";

const response = await fetch(
  "https://www.ilmeteo.it/meteo/roma"
);

const html = await response.text();

const $ = cheerio.load(html);

$("script").each((i, el) => {
  const text = $(el).html() || "";

  if (
    text.includes("probabil") ||
    text.includes("precipit") ||
    text.includes("forecast") ||
    text.includes("api")
  ) {
    console.log("\n========== SCRIPT " + i + " ==========\n");
    console.log(text.substring(0, 3000));
  }
});