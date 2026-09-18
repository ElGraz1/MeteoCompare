process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import Papa from "papaparse";

import { getAggregatedForecast } from "../src/services/forecastAggregatorService";

const app = express();

app.use(cors());

app.get("/locations", async (_req, res) => {
  try {
    const filePath = path.join(
      process.cwd(),
      "data",
      "ilmeteo_codici_comuni.csv",
    );

    console.log("CSV PATH:", filePath);
    const csv = fs.readFileSync(filePath, "utf8");
    console.log("CSV LOADED");

    const parsed = Papa.parse(csv, {
      delimiter: ";",
    });

    const locations = parsed.data
      .filter((row: any) => row.length >= 4)
      .map((row: any) => ({
        id: row[0],
        nome: row[1],
        provincia: row[2],
        regione: row[3],
      }));

    res.json(locations);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Errore caricamento località",
    });
  }
});

app.get("/", (req, res) => {
  res.json({
    status: "ok",
    service: "MeteoCompare API",
  });
});

app.get("/forecast/:city", async (req, res) => {
  try {
    const day = Number(req.query.day ?? 0);

    const result = await getAggregatedForecast(req.params.city, day);

    res.json(result);
  } catch (error) {
    console.error("ERRORE COMPLETO:", error);

    res.status(500).json({
      error: error instanceof Error ? error.message : "Errore",
    });
  }
});

const port = Number(process.env.PORT) || 3000;

app.listen(port, () => {
  console.log(`Server avviato sulla porta ${port}`);
});
