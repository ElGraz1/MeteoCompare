const url =
  "https://www.ilmeteo.it/box/previsioni.php?citta=5913&type=tri1";

const response = await fetch(url);

console.log("Status:", response.status);

const html = await response.text();

console.log(
  html.substring(0, 1000)
);