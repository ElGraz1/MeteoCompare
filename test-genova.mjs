process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

import * as cheerio from "cheerio";

const response = await fetch(
  "https://www.ilmeteo.it/meteo/genova"
);

const html = await response.text();

const $ = cheerio.load(html);

const forecasts = [];

function normalizeHour(hour) {

  let h = parseInt(hour, 10);

  if (h === 24) {
    h = 0;
  }

  return (
    String(h).padStart(2, "0") +
    ":00"
  );
}

$("tr.forecast_1h").each((_, row) => {

  const td = $(row).find("td");

  const dialogId =
    $(row).attr("data-dialogid");

 const dialog =
  $(`#dialog-dettaglio-${dialogId}`);

const dialogHtml =
  dialog.html() || "";

if (
  normalizeHour(
    $(td[0]).text().trim()
  ) === "02:00"
) {

  console.log(
    "Percepita:",
    dialogHtml.includes("Percepita")
  );

  console.log(
    "percepita:",
    dialogHtml.includes("percepita")
  );

}


  const descrizione =
    dialog.find(".previ-descri")
      .text()
      .trim();


  const mmMatch =
    dialogHtml.match(
      /(\d+(?:\.\d+)?)\s*&nbsp;mm/i
    ) ||
    dialogHtml.match(
      /(\d+(?:\.\d+)?)\s*mm/i
    );

  const accumulo =
    mmMatch
      ? Number(mmMatch[1])
      : 0;

  const grandineMatch =
    dialogHtml.match(
      /Grandine[\s\S]*?(\d+)%/i
    );

  const grandine =
    grandineMatch
      ? Number(grandineMatch[1])
      : 0;

  forecasts.push({

    ora: normalizeHour(
      $(td[0])
        .text()
        .trim()
    ),

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

    percepita: Number(
      $(td[11])
        .text()
        .trim()
        .replace(",", ".")
    ),

    pressione: Number(
      $(td[9]).text()
    ),

    umidita: Number(
      $(td[8]).text()
    ),

    probabilita: Number(
      $(td[6])
        .text()
        .replace("%", "")
    ),

    descrizione,

    accumulo,

    grandine,

  });

});

console.log(
  JSON.stringify(
    forecasts,
    null,
    2
  )
);