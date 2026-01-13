/**
 * Application configuration module surface.
 * @since 1.0.0
 */
import { type Environment } from './app/environment';
import { type ConfiguredLogLevel } from './app/loglevel';
import { type Port } from './app/port';

/**
 * Application runtime configuration values.
 * @since 1.0.0
 */
export type AppConfig = {
  readonly port: Port;
  readonly logLevel: ConfiguredLogLevel;
  readonly environment: Environment;
};
