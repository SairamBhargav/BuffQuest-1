import { betterAuth } from "better-auth";
import { Pool } from "pg";

export const auth = betterAuth({
    baseURL: process.env.BETTER_AUTH_URL,
    database: new Pool({
        connectionString: process.env.DATABASE_URL,
        max: 1, // important for serverless
    }),
    emailAndPassword: {
        enabled: true,
    },
    logger: {
        level: "error",
    },
});