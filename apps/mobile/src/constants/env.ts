import { z } from 'zod';

const envSchema = z.object({
  apiUrl: z.string().url().default('http://localhost:4000/api/v1'),
  appName: z.string().default('LexMate'),
  environment: z.enum(['development', 'staging', 'production']).default('development'),
});

export const ENV = envSchema.parse({
  apiUrl: process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1',
  appName: process.env.EXPO_PUBLIC_APP_NAME ?? 'LexMate',
  environment: process.env.EXPO_PUBLIC_ENV ?? 'development',
});
