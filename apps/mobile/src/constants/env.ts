import { Platform } from 'react-native';
import { z } from 'zod';

const getInitialApiUrl = (): string => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  // Android emulator routes host machine loopback through 10.0.2.2
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:4000/api/v1';
  }
  return 'http://localhost:4000/api/v1';
};

const envSchema = z.object({
  apiUrl: z.string().url().default('http://localhost:4000/api/v1'),
  appName: z.string().default('LexMate'),
  environment: z.enum(['development', 'staging', 'production']).default('development'),
});

export const ENV = envSchema.parse({
  apiUrl: getInitialApiUrl(),
  appName: process.env.EXPO_PUBLIC_APP_NAME ?? 'LexMate',
  environment: process.env.EXPO_PUBLIC_ENV ?? 'development',
});
