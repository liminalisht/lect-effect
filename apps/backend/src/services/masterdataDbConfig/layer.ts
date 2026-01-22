/**
 * Layer for loading and providing masterdata database configuration.
 * @since 1.0.0
 */
import { Layer} from 'effect';
import { type ConfigurationError } from '../errors.js';
import { MasterdataDbConfigService } from './interface.js';
import { masterdataDbConfigServiceImplementation } from './implementation.js';

/**
 * Loads and provides masterdata database configuration to the environment.
 * @since 1.0.0
 */
export const masterdataDbConfigLayer: Layer.Layer<MasterdataDbConfigService, ConfigurationError>
  = Layer.effect(
    MasterdataDbConfigService,
    masterdataDbConfigServiceImplementation,
  );
