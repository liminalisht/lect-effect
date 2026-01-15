/**
 * Item repository layer wiring.
 * @since 1.0.0
 */
import { Layer } from 'effect';
import { ItemRepo } from './interface';
import { itemRepoImplementation } from './implementation';

/**
 * Provides the live ItemRepo implementation.
 * @since 1.0.0
 */
export const itemRepoLayer = Layer.effect(ItemRepo, itemRepoImplementation);
