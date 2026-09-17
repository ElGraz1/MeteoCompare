import type { WeatherType } from "./WeatherType";

export interface ForecastItem {
  ora: string;
  temperatura: number;
  probabilita: number;
  accumulo: number;

  codiceIcona: number; // resta per debug

  weatherType: WeatherType;

  descrizione: string;
  umidita: number;
  pressione: number;
  grandine: number;
}
