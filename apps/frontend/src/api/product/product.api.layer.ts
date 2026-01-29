/**
 * Product API layer wiring.
 * @since 0.1.0
 */
import { Layer } from 'effect';
import { ProductApiService } from './product.api.interface';
import { productApiLive } from './product.api.live.js';

/**
 * Layer providing the live product API implementation.
 * @since 0.1.0
 * @category Layers
 */
export const ProductApiLayer = Layer.effect(ProductApiService, productApiLive);
