process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

import * as cheerio from "cheerio";

const response = await fetch(
  "https://www.ilmeteo.it/box/previsioni.php?citta=5913&type=tri1"
);

const html = await response.text();

const $ = cheerio.load(html);

const righe = [];

$("tr").each((_, row) => {
  const td = $(row).find("td");

  if (td.length >= 8) {

    const ora =
      $(td[0]).text().trim();

    if (
      ora &&
      /^[0-9]{2}\.[0-9]{2}$/.test(ora)
    ) {

      const temperatura =
        $(td[3])
          .text()
          .replace("°C", "")
          .trim();

      const precipitazioni =
        $(td[5])
          .text()
          .trim();

      righe.push({
        ora: ora.replace(".", ":"),
        temperatura,
        precipitazioni,
      });
    }
  }
});

console.log(righe);