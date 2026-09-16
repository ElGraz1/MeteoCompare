const API_BASE_URL =
  "http://192.168.1.12:3000";

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