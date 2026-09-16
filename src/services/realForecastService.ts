import {
  getForecastFromSite,
} from "./ilMeteoSiteParser";

export async function getRealForecast(
  slug: string
) {
  return await getForecastFromSite(
    slug
  );
}