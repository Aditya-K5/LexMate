import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { z } from 'zod';

const PC_LAN_IP = '192.168.1.2';
const API_PORT = '4000';
const API_PREFIX = '/api/v1';

/**
 * Detects whether the current Android runtime is an emulator.
 * Physical devices (Samsung, Xiaomi, Pixel physical, etc.) return false.
 */
export const isAndroidEmulator = (): boolean => {
  if (Platform.OS !== 'android') {
    return false;
  }

  const constants = (Platform.constants ?? {}) as Record<string, unknown>;
  const fingerprint = typeof constants.Fingerprint === 'string' ? constants.Fingerprint.toLowerCase() : '';
  const model = typeof constants.Model === 'string' ? constants.Model.toLowerCase() : '';
  const hardware = typeof constants.Hardware === 'string' ? constants.Hardware.toLowerCase() : '';
  const product = typeof constants.Product === 'string' ? constants.Product.toLowerCase() : '';
  const brand = typeof constants.Brand === 'string' ? constants.Brand.toLowerCase() : '';
  const manufacturer = typeof constants.Manufacturer === 'string' ? constants.Manufacturer.toLowerCase() : '';

  return (
    fingerprint.startsWith('generic') ||
    fingerprint.startsWith('google/sdk_gphone') ||
    model.includes('google_sdk') ||
    model.includes('emulator') ||
    model.includes('android sdk built for') ||
    hardware === 'goldfish' ||
    hardware === 'ranchu' ||
    product.includes('sdk') ||
    product.includes('emulator') ||
    brand === 'generic' ||
    manufacturer.includes('genymotion')
  );
};

/**
 * Extracts host IP from Expo Constants if running via Expo Go / dev client.
 */
export const getHostFromExpo = (): string | null => {
  try {
    const hostUri =
      Constants.expoConfig?.hostUri ??
      (Constants as unknown as { manifest2?: { extra?: { expoClient?: { hostUri?: string } } } })
        ?.manifest2?.extra?.expoClient?.hostUri;

    if (typeof hostUri === 'string' && hostUri.length > 0) {
      const ip = hostUri.split(':')[0];
      if (ip && ip !== 'localhost' && ip !== '127.0.0.1') {
        return ip;
      }
    }
  } catch {
    // Fallback if Constants is unavailable
  }
  return null;
};

export const getInitialApiUrl = (): string => {
  // 1. Web environment always uses localhost
  if (Platform.OS === 'web') {
    return process.env.EXPO_PUBLIC_WEB_API_URL || `http://localhost:${API_PORT}${API_PREFIX}`;
  }

  // 2. Android Emulator always uses 10.0.2.2 loopback alias
  if (isAndroidEmulator()) {
    return process.env.EXPO_PUBLIC_EMULATOR_API_URL || `http://10.0.2.2:${API_PORT}${API_PREFIX}`;
  }

  // 3. Physical Android & native devices: use PC LAN IP
  const lanIp =
    getHostFromExpo() ||
    process.env.EXPO_PUBLIC_LAN_IP ||
    PC_LAN_IP;

  return process.env.EXPO_PUBLIC_API_URL || `http://${lanIp}:${API_PORT}${API_PREFIX}`;
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
