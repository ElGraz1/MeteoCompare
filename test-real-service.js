process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const cheerio = require("cheerio");

async function test() {
  const response = await fetch(
    "https://www.ilmeteo.it/box/previsioni.php?citta=5913&type=tri1"
  );

  const html = await response.text();

  const $ = cheerio.load(html);

  const righe = [];

  $("tr").each((_, row) => {
    const td = $(row).find("td");

    if (td.length >= 8) {
      const ora = $(td[0])
        .text()
        .trim();

      if (
        ora &&
        /^[0-9]{2}\.[0-9]{2}$/.test(ora)
      ) {
        righe.push({
          ora,
          temperatura: $(td[3]).text().trim(),
          precipitazioni: $(td[5]).text().trim(),
        });
      }
    }
  });

  console.log(righe);
}

test();