import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cron from "node-cron";

import dataRouter from "./routes/dataRoutes";
import sheetRouter from "./routes/sheetRoutes";
import dashboardRouter from "./routes/dashboardRoutes";
import categoryRouter from "./routes/categoryRoutes";
import { errorHandler } from "./middleware/errorHandler";
import { sendMail } from "./utils/sendMail";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS?.split(",") || ["http://localhost:5173"];

if (!MONGO_URI) {
  console.error("MONGO_URI no definida. Asegúrate de configurarla en las variables de entorno.");
  process.exit(1);
}

app.use(cors({ origin: ALLOWED_ORIGINS }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/", (_req, res) => res.json({ status: "ok", message: "Bills API online" }));
app.use("/api/data", dataRouter);
app.use("/api/sheets", sheetRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/categories", categoryRouter);

app.use(errorHandler);

cron.schedule("0 9 1 * *", () => {
  console.log("[Cron] Enviando correo de recordatorio mensual");
  sendMail();
});

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("[DB] Conectado a MongoDB");
    app.listen(PORT, () => {
      console.log(`[Server] Escuchando en puerto ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("[DB] Error al conectar a MongoDB:", error.message);
    process.exit(1);
  });

export default app;
