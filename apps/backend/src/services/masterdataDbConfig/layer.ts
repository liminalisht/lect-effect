/**
 * Layer for loading and providing masterdata database configuration.
 * @since 0.1.0
 */
import { Layer} from 'effect';
import { type ConfigurationError } from '@lect-effect/services/errors';
import { MasterdataDbConfigService } from '@lect-effect/services/masterdataDbConfig';
import { masterdataDbConfigServiceImplementation } from './implementation.js';

/**
 * Loads and provides masterdata database configuration to the environment.
 * @since 0.1.0
 * @category Layers
 */
export const masterdataDbConfigLayer: Layer.Layer<MasterdataDbConfigService, ConfigurationError>
  = Layer.effect(
    MasterdataDbConfigService,
    masterdataDbConfigServiceImplementation,
  );
