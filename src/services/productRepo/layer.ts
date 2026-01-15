/**
 * Product repository layer wiring.
 * @since 1.0.0
 */
import { Layer } from 'effect';
import { ProductRepo } from './interface';
import { productRepoImplementation } from './implementation';

/**
 * Provides the live ProductRepo implementation.
 * @since 1.0.0
 */
export const productRepoLayer = Layer.effect(ProductRepo, productRepoImplementation);
