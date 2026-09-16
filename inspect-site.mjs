process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const response = await fetch(
  "https://www.ilmeteo.it/meteo/roma"
);

const html = await response.text();

const ricerche = [
  "precipit",
  "probabil",
  "temperatura",
  "pioggia",
  "__NEXT_DATA__",
  "window.",
  "forecast",
  "api"
];

for (const parola of ricerche) {
  console.log(
    parola,
    "=>",
    html.toLowerCase().includes(
      parola.toLowerCase()
    )
  );
}