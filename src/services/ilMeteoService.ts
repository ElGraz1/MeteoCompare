export type CitySuggestion = {
  id: string;
  nome: string;
  provincia: string;
  regione: string;
  popolazione: number;
};
import { loadLocations } from "./locationService";

export async function searchCity(testo: string): Promise<CitySuggestion[]> {
  const ricerca = testo.trim().toLowerCase();

  if (ricerca.length < 2) {
    return [];
  }

  const localitaDisponibili = await loadLocations();

  return localitaDisponibili
    .filter((localita: CitySuggestion) =>
      localita.nome.toLowerCase().includes(ricerca),
    )
    .sort((a, b) => {
      const exactA = a.nome.toLowerCase() === ricerca;

      const exactB = b.nome.toLowerCase() === ricerca;

      if (exactA !== exactB) {
        return exactB ? 1 : -1;
      }

      const startsA = a.nome.toLowerCase().startsWith(ricerca);

      const startsB = b.nome.toLowerCase().startsWith(ricerca);

      if (startsA !== startsB) {
        return startsB ? 1 : -1;
      }

      return b.popolazione - a.popolazione;
    })
    .slice(0, 20);
}

export async function getCityId(city: string) {
  const risultati = await searchCity(city);

  if (risultati.length === 0) {
    return null;
  }

  return risultati[0].id;
}

export async function testWidgetHtml(cityId: string) {
  const response = await fetch(
    `https://www.ilmeteo.it/box/previsioni.php?citta=${cityId}&type=tri1`,
  );

  const html = await response.text();

  return html;
}
