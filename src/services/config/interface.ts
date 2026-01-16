/**
 * Configuration service tag and shape.
 * @since 1.0.0
 */
import { Context } from 'effect';
import { type AppConfig } from '../appConfig/interface';
import { type MasterdataDbConfig } from '../masterdataDbConfig/interface';

/**
 * Service tag for application configuration.
 * @since 1.0.0
 */
export class ConfigService extends Context.Tag('ConfigService')<ConfigService, Config>() {}

/**
 * Shape of configuration values provided by ConfigService.
 * @since 1.0.0
 */
export type Config = {
  readonly app: AppConfig;
  readonly masterdataPg: MasterdataDbConfig;
};
