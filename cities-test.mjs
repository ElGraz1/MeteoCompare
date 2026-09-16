process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

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

  const count =
    (html.match(
      /forecast_1h/g
    ) || []).length;

  console.log(
    city,
    "=>",
    count
  );
}