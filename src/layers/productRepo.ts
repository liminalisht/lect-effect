/**
 * Product repository layer wiring.
 * @since 1.0.0
 */
import { Layer } from 'effect';
import { ProductRepo, ProductRepoLive } from '../services/productRepo';

/**
 * Provides the live ProductRepo implementation.
 * @since 1.0.0
 */
export const productRepoLayer = Layer.effect(ProductRepo, ProductRepoLive);
