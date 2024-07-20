import { Resend } from "resend";

const SENDER_KEY = process.env.SENDER_KEY;

export const sendMail = () => {
  const resend = new Resend(SENDER_KEY);

  resend.emails.send({
    from: "onboarding@resend.dev",
    to: ["nenriquev1@gmail.com"],
    subject: "Bills App",
    html: "<p>Congrats on sending your <strong>first email</strong>!</p>",
  });
};
