import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";

import dataRouter from "./routes/dataRoutes";
import sheetRouter from "./routes/sheetRoutes";
import dashboardRouter from "./routes/dashboardRoutes";
import categoryRouter from "./routes/categoryRoutes";
import aiProviderRouter from "./routes/aiProviderRoutes";
import authRouter from "./routes/authRoutes";
import cronRouter from "./routes/cronRoutes";
import { errorHandler } from "./middleware/errorHandler";

dotenv.config();

const app = express();
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS?.split(",") || ["http://localhost:5173"];

app.use(cors({
  origin: ALLOWED_ORIGINS,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

/* ── Cached MongoDB connection (works in serverless & local) ── */
let isConnected = false;

async function connectDB(): Promise<void> {
  if (isConnected) return;

  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error("MONGO_URI no definida en las variables de entorno.");
  }

  await mongoose.connect(uri);
  isConnected = true;
  console.log("[DB] Conectado a MongoDB");
}

app.use(async (_req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error("[DB] Error de conexión:", err);
    res.status(500).json({ error: "Error de conexión a la base de datos" });
  }
});

app.get("/", (_req, res) => res.json({ status: "ok", message: "Bills API online" }));
app.use("/api/auth", authRouter);
app.use("/api/data", dataRouter);
app.use("/api/sheets", sheetRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/ai-providers", aiProviderRouter);
app.use("/api/cron", cronRouter);

app.use(errorHandler);

/* ── Local dev: listen + cron ── */
if (process.env.NODE_ENV !== "production") {
  const initialPort = Number(process.env.PORT) || 3000;

  const startServer = (port: number) => {
    const server = app.listen(port);

    server.on("listening", () => {
      console.log(`[Server] Escuchando en puerto ${port}`);

      // Cargar cron después de que el servidor esté listo
      import("node-cron").then(({ default: cron }) => {
        const { sendMail } = require("./utils/sendMail");
        cron.schedule("0 9 1 * *", () => {
          console.log("[Cron] Enviando correo de recordatorio mensual");
          sendMail();
        });
      });
    });

    server.on("error", (err: any) => {
      if (err.code === "EADDRINUSE") {
        console.log(`[Server] Puerto ${port} ocupado, probando con ${port + 1}...`);
        startServer(port + 1);
      } else {
        console.error("[Server] Error inesperado:", err);
      }
    });
  };

  connectDB()
    .then(() => {
      startServer(initialPort);
    })
    .catch((err) => {
      console.error("[DB] Error al conectar:", err.message);
    });
}

export default app;
