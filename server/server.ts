process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import Papa from "papaparse";

import { getAggregatedForecast } from "../src/services/forecastAggregatorService";
import { sendPushNotification } from "./services/expoPushService";
import { generateNotification } from "../src/services/notificationService";
import { generateServerNotification } from "./services/generateServerNotification";
import { runNotifications } from "./services/notificationRunner";
import { startScheduler } from "./scheduler";
const app = express();

app.use(cors());
app.use(express.json());

app.post("/notification-subscriptions", (req, res) => {
  const filePath = path.join(
    process.cwd(),
    "data",
    "notification-subscriptions.json",
  );

  let subscriptions = [];

  if (fs.existsSync(filePath)) {
    subscriptions = JSON.parse(fs.readFileSync(filePath, "utf8"));
  }

  const existingIndex = subscriptions.findIndex(
    (item: any) => item.installationId === req.body.installationId,
  );

  if (existingIndex >= 0) {
    subscriptions[existingIndex] = req.body;
  } else {
    subscriptions.push(req.body);
  }

  fs.writeFileSync(filePath, JSON.stringify(subscriptions, null, 2), "utf8");

  res.json({
    success: true,
  });
});

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
        popolazione: Number(row[4]) || 0,
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

app.post("/send-weather-notification", async (_req, res) => {
  const sentNotifications = await runNotifications();

  res.json({
    success: true,
    sentNotifications,
  });
});

const port = Number(process.env.PORT) || 3000;

startScheduler();

app.listen(port, () => {
  console.log(`Server avviato sulla porta ${port}`);
});
