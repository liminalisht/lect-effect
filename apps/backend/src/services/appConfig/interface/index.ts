/**
 * Application configuration module surface.
 * @since 1.0.0
 */
import { Context } from 'effect';
import { type Environment } from './environment.js';
import { type ConfiguredLogLevel } from './loglevel.js';
import { type Port } from './port.js';

/**
 * Application runtime configuration values.
 * @since 1.0.0
 * @category Service Interfaces
 */
export type AppConfig = {
  readonly port: Port;
  readonly logLevel: ConfiguredLogLevel;
  readonly environment: Environment;
};

/**
 * Tag for accessing application configuration values.
 * @since 1.0.0
 * @category Services
 */
export class AppConfigService extends Context.Tag('services/appConfig')<AppConfigService, AppConfig>() {}

