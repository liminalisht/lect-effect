/**
 * Product repository layer wiring.
 * @since 1.0.0
 */
import { Layer } from 'effect';
import { ProductRepo } from '../../services/productRepo';
import { productRepoImplementation } from '../implementations/productRepo';

/**
 * Provides the live ProductRepo implementation.
 * @since 1.0.0
 */
export const productRepoLayer = Layer.effect(ProductRepo, productRepoImplementation);
