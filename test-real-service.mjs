import {
  getRealForecast,
} from "./src/services/realForecastService.js";

const data =
  await getRealForecast("5913");

console.log(data);