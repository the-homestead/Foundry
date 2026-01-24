import nodemailer from "nodemailer";

const SMTP_HOST = process.env.SMTP_HOST ?? "";
const SMTP_PORT = Number(process.env.SMTP_PORT ?? 587);
const SMTP_USER = process.env.SMTP_USER ?? "";
const SMTP_PASS = process.env.SMTP_PASS ?? "";
const SMTP_FROM = process.env.SMTP_FROM ?? "no-reply@example.com";

const TRAILING_SLASH_RE = /\/$/;

let transporter: nodemailer.Transporter | null = null;
if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
    transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: SMTP_PORT,
        secure: SMTP_PORT === 465,
        auth: {
            user: SMTP_USER,
            pass: SMTP_PASS,
        },
    });
}

export async function sendResetEmail(to: string, token: string) {
    const base = process.env.NEXT_PUBLIC_APP_URL ?? process.env.NEXT_SERVER_APP_URL ?? "";
    const resetUrl = base ? `${base.replace(TRAILING_SLASH_RE, "")}/auth/reset/${token}` : `/auth/reset/${token}`;

    const html = `
        <p>Hello,</p>
        <p>We received a request to reset your password. Click the link below to set a new password. The link will expire in one hour.</p>
        <p><a href="${resetUrl}">Reset password</a></p>
        <p>If you didn't request this, you can safely ignore this email.</p>
    `;

    const text = `Reset your password: ${resetUrl}`;

    if (!transporter) {
        // Log the reset link for development when SMTP is not configured
        console.warn("SMTP not configured — reset link:", resetUrl);
        return;
    }

    await transporter.sendMail({
        from: SMTP_FROM,
        to,
        subject: "Reset your password",
        text,
        html,
    });
}
