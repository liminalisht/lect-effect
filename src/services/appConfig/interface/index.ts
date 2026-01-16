/**
 * Application configuration module surface.
 * @since 1.0.0
 */
import { Context, Effect, Layer } from 'effect';
import { type Environment } from './environment';
import { type ConfiguredLogLevel } from './loglevel';
import { type Port } from './port';

/**
 * Application runtime configuration values.
 * @since 1.0.0
 */
export type AppConfig = {
  readonly port: Port;
  readonly logLevel: ConfiguredLogLevel;
  readonly environment: Environment;
};

export class AppConfigService extends Context.Tag('services/appConfig')<AppConfigService, AppConfig>() {}

