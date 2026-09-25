import { APP_CONFIG } from '@lexmate/config';

export function bootstrap() {
  return `Starting ${APP_CONFIG.name} API server...`;
}
