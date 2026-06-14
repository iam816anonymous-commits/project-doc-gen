import { z } from 'zod';

const envSchema = z.object({
  GEMINI_API_KEY: z.string().min(1, "GEMINI_API_KEY is required"),
  ADMIN_SECRET: z.string().min(8, "ADMIN_SECRET must be at least 8 characters"),
  BASE_URL: z.string().url("BASE_URL must be a valid URL").default("https://reportready.cc.cd"),
  SUPPORT_EMAIL: z.string().email("SUPPORT_EMAIL must be a valid email").default("support@reportready.in"),
  WHATSAPP_SUPPORT_NUMBER: z.string().optional(),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
});

export function validateEnv() {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error('❌ Invalid environment variables:', result.error.flatten().fieldErrors);
    throw new Error('Environment validation failed');
  }

  return result.data;
}
