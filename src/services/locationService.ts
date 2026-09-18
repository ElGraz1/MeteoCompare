export type CitySuggestion = {
  id: string;
  nome: string;
  provincia: string;
  regione: string;
};

export async function loadLocations() {
  const response = await fetch(
    "https://site--meteocompare-api--ddx7k442y97b.code.run/locations",
  );

  return await response.json();
}
