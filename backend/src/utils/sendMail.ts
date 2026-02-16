import { Resend } from "resend";

const SENDER_KEY = process.env.SENDER_KEY;
const NOTIFICATION_EMAIL = process.env.NOTIFICATION_EMAIL;

export const sendMail = async () => {
  if (!SENDER_KEY || !NOTIFICATION_EMAIL) {
    console.warn("[Mail] SENDER_KEY o NOTIFICATION_EMAIL no configurados");
    return;
  }

  const resend = new Resend(SENDER_KEY);

  try {
    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: [NOTIFICATION_EMAIL],
      subject: "Bills App - Recordatorio mensual",
      html: `
        <h2>Recordatorio mensual</h2>
        <p>Recuerda subir los extractos bancarios de este mes a la aplicación.</p>
      `,
    });
    console.log("[Mail] Correo de recordatorio enviado");
  } catch (error) {
    console.error("[Mail] Error al enviar correo:", error);
  }
};
