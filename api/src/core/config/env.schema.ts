import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  PORT: z.coerce.number().int().positive().default(8080),

  SWAGGER_PATH: z.string().default('docs'),

  DATABASE_URL: z.string().min(1),

  // Database connection pool configuration
  DATABASE_POOL_MAX: z.coerce.number().int().positive().default(20),
  DATABASE_POOL_MIN: z.coerce.number().int().positive().default(5),
  DATABASE_POOL_IDLE_TIMEOUT: z.coerce.number().int().positive().default(30000),
  DATABASE_POOL_CONNECTION_TIMEOUT: z.coerce
    .number()
    .int()
    .positive()
    .default(5000),
  DATABASE_POOL_MAX_USES: z.coerce.number().int().positive().default(7500),

  CORS_ORIGIN: z.string().default('*'),

  // Rate limiting for authentication endpoints
  THROTTLE_TTL: z.coerce.number().int().positive().default(60), // seconds
  THROTTLE_LIMIT: z.coerce.number().int().positive().default(10), // requests per TTL

  JWT_ACCESS_SECRET: z.string().min(16),
  JWT_ACCESS_TTL_SECONDS: z.coerce.number().int().positive().default(900),
  JWT_REFRESH_SECRET: z.string().min(16),
  JWT_REFRESH_TTL_DAYS: z.coerce.number().int().positive().default(30),

  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GOOGLE_CALLBACK_URL: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;
