export type CitySuggestion = {
  id: string;
  nome: string;
  provincia: string;
  regione: string;
};

const localitaDisponibili: CitySuggestion[] = [
  {
    id: "roma-rm",
    nome: "Roma",
    provincia: "RM",
    regione: "Lazio",
  },
  {
    id: "roma-fiumicino-rm",
    nome: "Roma Fiumicino",
    provincia: "RM",
    regione: "Lazio",
  },
  {
    id: "roma-tiburtina-rm",
    nome: "Roma Tiburtina",
    provincia: "RM",
    regione: "Lazio",
  },
  {
    id: "milano-mi",
    nome: "Milano",
    provincia: "MI",
    regione: "Lombardia",
  },
  {
    id: "milano-linate-mi",
    nome: "Milano Linate",
    provincia: "MI",
    regione: "Lombardia",
  },
  {
    id: "salerno-sa",
    nome: "Salerno",
    provincia: "SA",
    regione: "Campania",
  },
  {
    id: "napoli-na",
    nome: "Napoli",
    provincia: "NA",
    regione: "Campania",
  },
];

export async function searchCity(
  testo: string
): Promise<CitySuggestion[]> {
  const ricerca = testo.trim().toLowerCase();

  if (ricerca.length < 2) {
    return [];
  }

  return localitaDisponibili
    .filter((localita) =>
      localita.nome.toLowerCase().includes(ricerca)
    )
    .slice(0, 5);
}

export async function getCityId(
  city: string
) {
  const risultati = await searchCity(city);

  if (risultati.length === 0) {
    return null;
  }

  return risultati[0].id;
}