/*const API_BASE_URL =
  "https://site--meteocompare-api--ddx7k442y97b.code.run"; */

  const API_BASE_URL =
  "http://10.0.2.2:3000";

export async function getForecastsByCity(
  city: string,
  day: number = 0
) {

const url =
  `${API_BASE_URL}/forecast/${city.toLowerCase()}?day=${day}`;

console.log(
  "API URL:",
  url
);

const response =
  await fetch(url);

  if (!response.ok) {

    throw new Error(
      `HTTP ${response.status}`
    );

  }

  return response.json();

}