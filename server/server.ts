process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

import express from "express";
import cors from "cors";

import {
  getAggregatedForecast,
} from "../src/services/forecastAggregatorService";

const app = express();

app.use(cors());

app.get(
  "/forecast/:city",
  async (req, res) => {

    try {

      const result =
        await getAggregatedForecast(
          req.params.city
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
``