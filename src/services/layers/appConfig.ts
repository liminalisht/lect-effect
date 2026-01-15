/**
 * Layer for loading and providing application configuration.
 * @since 1.0.0
 */
import { Layer
} from 'effect';

import { type ConfigurationError } from '../interfaces/config/errors';
import { AppConfigService } from '../interfaces/config/appConfig/appConfig';
import { appConfigImplementation } from '../implementations/appConfig';

/**
 * Provides configuration values to the environment.
 * @since 1.0.0
 */
export const appConfigLayer: Layer.Layer<AppConfigService, ConfigurationError>
  = Layer.effect(
    AppConfigService,
    appConfigImplementation
  );
