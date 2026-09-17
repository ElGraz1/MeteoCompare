import type { WeatherType } from "../types/WeatherType";

export const weatherIcons: Record<WeatherType, string> = {
  sun: "☀️",

  partlyCloudy: "⛅",

  cloudy: "☁️",

  rainLight: "🌦️",

  rain: "🌧️",

  storm: "⛈️",

  snow: "🌨️",

  fog: "🌫️",

  wind: "💨",
};
