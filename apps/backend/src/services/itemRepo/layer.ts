/**
 * Item repository layer wiring.
 * @since 0.1.0
 */
import { Layer } from 'effect';
import { type MasterdataDbService } from '@lect-effect/services/masterdataDb';
import { ItemRepoService } from '@lect-effect/services/itemRepo';
import { itemRepoServiceImplementation } from './implementation.js';

/**
 * Provides the live ItemRepo implementation.
 * @since 0.1.0
 * @category Layers
 */
export const itemRepoLayer: Layer.Layer<ItemRepoService, never, MasterdataDbService>
  = Layer.effect(ItemRepoService, itemRepoServiceImplementation);
