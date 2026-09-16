// find-dialogs.mjs

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

import * as cheerio from "cheerio";

const response = await fetch(
  "https://www.ilmeteo.it/meteo/genova"
);

const html = await response.text();

const $ = cheerio.load(html);

$("[id^='dialog-dettaglio-']")
  .each((i, el) => {

    console.log(
      "\n========== DIALOG ==========\n"
    );

    console.log(
      $.html(el)
        .substring(0, 5000)
    );
  });