/**
 * Product repository layer wiring.
 * @since 0.1.0
 */
import { Layer } from 'effect';
import { ProductRepoService } from '@lect-effect/services/productRepo';
import { productRepoImplementation } from './implementation.js';

/**
 * Provides the live ProductRepo implementation.
 * @since 0.1.0
 * @category Layers
 */
export const productRepoLayer = Layer.effect(ProductRepoService, productRepoImplementation);
