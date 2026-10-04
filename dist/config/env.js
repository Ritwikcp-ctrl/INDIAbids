import { z } from "zod";
const envSchema = z.object({
    NODE_ENV: z
        .enum(["development", "test", "production"])
        .default("development"),
    PORT: z.coerce.number().int().min(1).max(65_535).default(4000),
    DATABASE_URL: z.string().min(1),
    CORS_ORIGIN: z.string().url(),
    LOG_LEVEL: z
        .enum(["fatal", "error", "warn", "info", "debug", "trace"])
        .default("info"),
    ACCESS_TOKEN_SECRET: z.string().min(43),
    ACCESS_TOKEN_ISSUER: z.string().min(1),
    ACCESS_TOKEN_AUDIENCE: z.string().min(1),
    ACCESS_TOKEN_TTL_MINUTES: z.coerce.number().int().min(5).max(60).default(15),
    REFRESH_TOKEN_TTL_DAYS: z.coerce.number().int().min(1).max(90).positive().default(30),
    TRUST_PROXY: z.coerce.number().int().min(0).default(0),
    RAZORPAY_KEY_ID: z.string().min(1),
    RAZORPAY_KEY_SECRET: z.string().min(1),
    RAZORPAY_WEBHOOK_SECRET: z.string().min(1),
    PAYMENT_ORDER_TTL_MINUTES: z.coerce.number().int().min(5).max(60).default(30),
});
export const env = envSchema.parse(process.env);
