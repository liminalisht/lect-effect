/**
 * Item repository layer wiring.
 * @since 1.0.0
 */
import { Layer } from 'effect';
import { type MasterdataDbService } from '../masterdataDb/interface';
import { ItemRepoService } from './interface';
import { itemRepoServiceImplementation } from './implementation';

/**
 * Provides the live ItemRepo implementation.
 * @since 1.0.0
 */
export const itemRepoLayer: Layer.Layer<ItemRepoService, never, MasterdataDbService>
  = Layer.effect(ItemRepoService, itemRepoServiceImplementation);
