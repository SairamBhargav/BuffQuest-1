import { betterAuth } from "better-auth";
import { APIError } from "better-auth/api";
import { Pool } from "pg";
import nodemailer from "nodemailer";

const globalForAuth = globalThis as unknown as {
    pool: Pool | undefined;
    transporter: nodemailer.Transporter | undefined;
};

const transporter = globalForAuth.transporter ?? nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const pool = globalForAuth.pool ?? new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 1, // important for serverless
});

if (process.env.NODE_ENV !== "production") {
    globalForAuth.transporter = transporter;
    globalForAuth.pool = pool;
}

export const auth = betterAuth({
    baseURL: process.env.BETTER_AUTH_URL,
    database: pool,
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: true,
    },
    emailVerification: {
        sendOnSignUp: true,
        autoSignInAfterVerification: true,
        sendVerificationEmail: async ({ user, url }, request) => {
            // Rewrite verification URL to always use the configured base URL
            // (prevents localhost links when triggered from local dev)
            const baseURL = process.env.BETTER_AUTH_URL || '';
            const parsed = new URL(url);
            const correctUrl = new URL(parsed.pathname + parsed.search, baseURL).toString();

            try {
                await transporter.sendMail({
                    from: `"BuffQuest" <${process.env.EMAIL_USER}>`,
                    to: user.email,
                    subject: "Verify your email address for BuffQuest",
                    html: `<p>Please click the link below to verify your email address:</p><p><a href="${correctUrl}">Verify Email</a></p>`,
                });
            } catch (error: any) {
                console.error("Failed to send verification email via Nodemailer:", error.message, error);
                throw new APIError("BAD_REQUEST", { message: "Failed to send verification email: " + (error?.message || "Unknown error") });
            }
        },
    },
    databaseHooks: {
        user: {
            create: {
                before: async (user) => {
                    if (!user.email.endsWith("@colorado.edu")) {
                        throw new APIError("BAD_REQUEST", {
                            message: "Only @colorado.edu emails are allowed to register.",
                        });
                    }
                    return { data: user };
                },
            },
        },
    },
});