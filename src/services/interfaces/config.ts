/**
 * Configuration service tag and shape.
 * @since 1.0.0
 */
import { Context } from 'effect';
import { type AppConfig } from './config/appConfig/appConfig';
import { type MasterdataDbConfig } from './config/masterdataDbConfig';

/**
 * Service tag for application configuration.
 * @since 1.0.0
 */
export class ConfigService extends Context.Tag('ConfigService')<ConfigService, ConfigServiceShape>() {}

/**
 * Shape of configuration values provided by ConfigService.
 * @since 1.0.0
 */
export type ConfigServiceShape = {
  readonly app: AppConfig;
  readonly masterdataPg: MasterdataDbConfig;
};
