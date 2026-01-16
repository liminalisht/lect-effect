/**
 * Layer for loading and providing masterdata database configuration.
 * @since 1.0.0
 */
import { Layer} from 'effect';
import { type ConfigurationError } from '../errors';
import { MasterdataDbConfigService } from './interface';
import { masterdataDbConfigServiceImplementation } from './implementation';

/**
 * Loads and provides masterdata database configuration to the environment.
 * @since 1.0.0
 */
export const masterdataDbLayer: Layer.Layer<MasterdataDbConfigService, ConfigurationError>
  = Layer.effect(
    MasterdataDbConfigService,
    masterdataDbConfigServiceImplementation,
  );
