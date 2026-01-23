/**
 * Product repository service contract and live implementation.
 * @since 1.0.0
 */
import { Context, } from 'effect';
// todo: this is not how we do errors... why not use TaggedError like elsewhere?
/**
 * Error thrown when a product lookup fails.
 * @since 1.0.0
 */
export class ProductNotFound extends Error {
    id;
    get _tag() {
        return 'ProductNotFound';
    }
    constructor(id) {
        super(`Product not found: ${id}`);
        this.id = id;
    }
}
/**
 * Service tag for the product repository.
 * @since 1.0.0
 * @category Services
 */
export class ProductRepoService extends Context.Tag('services/productRepo')() {
}
