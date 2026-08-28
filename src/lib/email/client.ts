import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;

export const resend = apiKey ? new Resend(apiKey) : null;

export const emailFrom =
  process.env.EMAIL_FROM ?? "OtakuYa <onboarding@resend.dev>";