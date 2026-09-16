process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

import {
  getForecastFromSite,
} from "./src/services/ilMeteoSiteParser";

async function main() {

  const data =
    await getForecastFromSite(
      "genova"
    );

  console.log(
    "Numero righe:",
    data.length
  );

  console.log(
    "\nORE RESTITUITE:"
  );

  console.log(
    data.map(
      (item) => item.ora
    )
  );

}

main().catch(
  console.error
);