const API_BASE_URL =
  "https://site--meteocompare-api--ddx7k442y97b.code.run";

export async function getForecastsByCity(
  city: string
) {

  const response =
    await fetch(
      `${API_BASE_URL}/forecast/${city.toLowerCase()}`
    );

  if (!response.ok) {

    throw new Error(
      `HTTP ${response.status}`
    );

  }

  return response.json();

}