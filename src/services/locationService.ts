import Papa from "papaparse";

export type CitySuggestion = {
  id: string;
  nome: string;
  provincia: string;
  regione: string;
};

export async function loadLocations() {
  const response = await fetch(
    "/ilmeteo_codici_comuni.csv"
  );

  const csv = await response.text();

  const parsed = Papa.parse(csv, {
    delimiter: ";",
  });

  return parsed.data
    .filter((row: any) => row.length >= 4)
    .map((row: any) => ({
      id: row[0],
      nome: row[1],
      provincia: row[2],
      regione: row[3],
    }));
}
``