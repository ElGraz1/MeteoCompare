import type { WeatherType } from "../types/WeatherType";

export function mapIlMeteoCode(code: number): WeatherType {
  switch (code) {
    case 1:
    case 101:
      return "sun";

    case 3:
    case 4:
    case 103:
    case 104:
      return "partlyCloudy";

    case 7:
    case 8:
      return "cloudy";

    case 5:
    case 54:
    case 105:
      return "rainLight";

    case 60:
    case 61:
    case 109:
      return "rain";

    case 13:
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

  if (text.includes("rovesci") || text.includes("pioggia e schiarite")) {
    return "rainLight";
  }

  if (
    text.includes("schiarite") ||
    text.includes("parz") ||
    text.includes("parzial")
  ) {
    return "partlyCloudy";
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

export function mapDescriptionToWeatherType(description: string): WeatherType {
  const text = description.toLowerCase();

  if (text.includes("temporale")) {
    return "storm";
  }

  if (
    text.includes("rovesci") ||
    text.includes("pioggia e schiarite") ||
    text.includes("qualche pioggia")
  ) {
    return "rainLight";
  }

  if (text.includes("pioggia")) {
    return "rain";
  }

  if (
    text.includes("nubi sparse") ||
    text.includes("poco nuvoloso") ||
    text.includes("parz") ||
    text.includes("parzial")
  ) {
    return "partlyCloudy";
  }

  if (
    text.includes("nuvoloso") ||
    text.includes("molto nuvoloso") ||
    text.includes("coperto")
  ) {
    return "cloudy";
  }

  if (text.includes("sereno")) {
    return "sun";
  }

  if (text.includes("neve")) {
    return "snow";
  }

  if (text.includes("nebbia")) {
    return "fog";
  }

  return "cloudy";
}
