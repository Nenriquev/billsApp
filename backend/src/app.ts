import express from "express";
import userRouter from "./routes/userRoutes";
import sheetRouter from "./routes/sheetRoutes";
import cors from "cors";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import dotenv from "dotenv";
import dataRouter from "./routes/dataRoutes";
import cron from "node-cron";
import { sendMail } from "./utils/sendMail";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("MONGO_URI not defined. Make sure it is set in your environment variables.");
  process.exit(1);
}

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });

app.listen(PORT, async () => {
  console.log(`Server is listening on port ${PORT}`);
});

cron.schedule("0 9 1 * *", () => {
  console.log("Ejecutando tarea programada: Enviar correo de recordatorio");
  sendMail()
});

app.get("/", (req, res) => res.send("Server online"));
app.use("/api/data", dataRouter);
app.use("/api/users", userRouter);
app.use("/api/sheet", sheetRouter);
