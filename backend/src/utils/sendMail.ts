import { Resend } from "resend";
import User from "../models/User";

const SENDER_KEY = process.env.SENDER_KEY;

export const sendMail = async () => {
  if (!SENDER_KEY) {
    console.warn("[Mail] SENDER_KEY no configurada");
    return;
  }

  const resend = new Resend(SENDER_KEY);

  // Buscar todos los usuarios con notificaciones habilitadas
  const users = await User.find({ notificationsEnabled: true }).select("email name");

  if (users.length === 0) {
    console.log("[Mail] No hay usuarios con notificaciones habilitadas");
    return;
  }

  let sent = 0;
  let failed = 0;

  for (const user of users) {
    try {
      await resend.emails.send({
        from: "onboarding@resend.dev",
        to: [user.email],
        subject: "Bills App - Recordatorio mensual",
        html: `
          <h2>Hola ${user.name} 👋</h2>
          <p>Recuerda subir los extractos bancarios de este mes a la aplicación.</p>
        `,
      });
      sent++;
    } catch (error) {
      console.error(`[Mail] Error al enviar correo a ${user.email}:`, error);
      failed++;
    }
  }

  console.log(`[Mail] Recordatorios enviados: ${sent} éxito, ${failed} fallidos de ${users.length} usuarios`);
};
