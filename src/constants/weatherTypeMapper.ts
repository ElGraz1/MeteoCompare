import type { WeatherType } from "../types/WeatherType";

export function mapIlMeteoCode(code: number): WeatherType {
  switch (code) {
    case 1:
      return "sun";

    case 3:
      return "partlyCloudy";

    case 7:
    case 8:
      return "cloudy";

    case 54:
      return "rainLight";

    case 60:
    case 61:
    case 109:
      return "rain";

    case 110:
      return "storm";

    default:
      return "cloudy";
  }
}

export function map3BMeteoDescription(description: string): WeatherType {
  const text = description.toLowerCase();

  if (text.includes("temporale")) {
    return "storm";
  }

  if (
    text.includes("schiarite") ||
    text.includes("parz") ||
    text.includes("parzial")
  ) {
    return "rainLight";
  }

  if (text.includes("nubi sparse") || text.includes("poco nuvoloso")) {
    return "partlyCloudy";
  }

  if (text.includes("sereno")) {
    return "sun";
  }

  if (text.includes("pioggia")) {
    return "rain";
  }

  if (
    text.includes("nuvoloso") ||
    text.includes("molto nuvoloso") ||
    text.includes("coperto")
  ) {
    return "cloudy";
  }

  if (text.includes("neve")) {
    return "snow";
  }

  if (text.includes("nebbia")) {
    return "fog";
  }

  return "cloudy";
}
