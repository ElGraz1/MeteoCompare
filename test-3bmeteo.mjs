import {
  getForecastFrom3BMeteo
} from "./src/services/treBMeteoSiteParser";

async function main() {

  const data =
    await getForecastFrom3BMeteo(
      "genova"
    );

  console.log(
    data[0]
  );

}

main().catch(console.error);