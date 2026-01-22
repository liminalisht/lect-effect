/**
 * Product repository layer wiring.
 * @since 1.0.0
 */
import { Layer } from 'effect';
import { ProductRepoService } from './interface.js';
import { productRepoImplementation } from './implementation.js';

/**
 * Provides the live ProductRepo implementation.
 * @since 1.0.0
 */
export const productRepoLayer = Layer.effect(ProductRepoService, productRepoImplementation);
