/**
 * Item repository layer wiring.
 * @since 1.0.0
 */
import { Layer } from 'effect';
import { type MasterdataDbService } from '../masterdataDb/interface.js';
import { ItemRepoService } from './interface.js';
import { itemRepoServiceImplementation } from './implementation.js';

/**
 * Provides the live ItemRepo implementation.
 * @since 1.0.0
 * @category Layers
 */
export const itemRepoLayer: Layer.Layer<ItemRepoService, never, MasterdataDbService>
  = Layer.effect(ItemRepoService, itemRepoServiceImplementation);
