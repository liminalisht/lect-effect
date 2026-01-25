/**
 * Layer for loading and providing application configuration.
 * @since 1.0.0
 */
import { Layer} from 'effect';
import { type ConfigurationError } from '@lect-effect/services/errors';
import { AppConfigService } from '@lect-effect/services/appConfig';
import { appConfigServiceImplementation } from './implementation.js';

/**
 * Provides configuration values to the environment.
 * @since 1.0.0
 * @category Layers
 */
export const appConfigLayer: Layer.Layer<AppConfigService, ConfigurationError>
  = Layer.effect(
    AppConfigService,
    appConfigServiceImplementation,
  );
