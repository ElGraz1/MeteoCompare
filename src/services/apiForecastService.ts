const API_BASE_URL = "https://site--meteocompare-api--ddx7k442y97b.code.run";

export async function getForecastsByCity(city: string, day: number = 0) {
  const url = `${API_BASE_URL}/forecast/${city.toLowerCase()}?day=${day}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return response.json();
}

export async function clearForecastCache(city: string) {
  const response = await fetch(`${API_BASE_URL}/cache/${city.toLowerCase()}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return response.json();
}
