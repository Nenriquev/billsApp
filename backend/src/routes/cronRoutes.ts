import { Router, Request, Response } from "express";
import { sendMail } from "../utils/sendMail";

const cronRouter = Router();

/**
 * POST /api/cron/monthly-reminder
 *
 * Endpoint llamado por Vercel Cron Jobs (o manualmente) para
 * enviar el correo de recordatorio mensual.
 *
 * Protegido con CRON_SECRET para evitar llamadas no autorizadas.
 */
cronRouter.post("/monthly-reminder", async (req: Request, res: Response) => {
  // Verificar que la petición viene de Vercel Cron
  const authHeader = req.headers.authorization;
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    console.warn("[Cron] Intento no autorizado de ejecutar el cron job");
    res.status(401).json({ error: "No autorizado" });
    return;
  }

  try {
    await sendMail();
    res.status(200).json({ success: true, message: "Correo de recordatorio enviado" });
  } catch (error) {
    console.error("[Cron] Error al enviar correo:", error);
    res.status(500).json({ error: "Error al enviar el correo de recordatorio" });
  }
});

export default cronRouter;
