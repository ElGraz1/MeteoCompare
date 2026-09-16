process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const response = await fetch(
  "https://www.ilmeteo.it/box/previsioni.php?citta=5913&type=tri1"
);

console.log("Status:", response.status);

const html = await response.text();

console.log(
  html.substring(0, 500)
);