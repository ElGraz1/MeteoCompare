import {
  getRealForecast
} from "../services/realForecastService";

export async function testForecast() {

  const data =
    await getRealForecast(
      "genova"
    );

  console.log(data);

  return data;
}
