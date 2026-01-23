import { Layer } from 'effect';
import { ProductApiService } from './product.api.interface';
import { productApiLive } from './product.api.live.js';

export const ProductApiLayer = Layer.effect(ProductApiService, productApiLive);
