/**
 * Item repository layer wiring.
 * @since 1.0.0
 */
import { Layer } from 'effect';
import { ItemRepo, ItemRepoLive } from '../services/itemRepo';

/**
 * Provides the live ItemRepo implementation.
 * @since 1.0.0
 */
export const itemRepoLayer = Layer.effect(ItemRepo, ItemRepoLive);
