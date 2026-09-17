process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

import express from "express";
import cors from "cors";

import {
  getAggregatedForecast,
} from "../src/services/forecastAggregatorService";

const app = express();

app.use(cors());

app.get("/", (req, res) => {
  res.json({
    status: "ok",
    service: "MeteoCompare API"
  });
});

app.get(
  "/forecast/:city",
  async (req, res) => {

    try {

      const day =
      Number(req.query.day ?? 0);

      const result =
        await getAggregatedForecast(
          req.params.city,
          day
        );

      res.json(result);

    } catch (error) {

console.error(
  "ERRORE COMPLETO:",
  error
);

res.status(500).json({
  error:
    error instanceof Error
      ? error.message
      : "Errore"
});

    }

  }
);

const port =
  Number(process.env.PORT) || 3000;


app.listen(
  port,
  () => {

    console.log(
      `Server avviato sulla porta ${port}`
    );

  }
);