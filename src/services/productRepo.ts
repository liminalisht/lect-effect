/**
 * Product repository service contract and live implementation.
 * @since 1.0.0
 */
import {
  Context, type Effect, type Option,
} from 'effect';
import type * as SqlError from '@effect/sql/SqlError';
import { type ParseError } from 'effect/ParseResult';
import { type Product } from '../domain/product/product';
import { type ProductId } from '../domain/product/productId';
import { type ProductInput } from '../domain/product/productInput';
import type { ItemId } from '../domain/item/itemId';

// todo: this is not how we do errors... why not use TaggedError like elsewhere?
/**
 * Error thrown when a product lookup fails.
 * @since 1.0.0
 */
export class ProductNotFound extends Error {
  get _tag(): 'ProductNotFound' {
    return 'ProductNotFound';
  }

  constructor(readonly id: ProductId) {
    super(`Product not found: ${id}`);
  }
}

// todo: move / import in AppError
/**
 * Error type union for product repository operations.
 * @since 1.0.0
 */
export type ProductRepoError = SqlError.SqlError | ProductNotFound | ParseError;

/**
 * Interface for product repository capabilities.
 * @since 1.0.0
 */
export type ProductRepoShape = {
  readonly getById: (id: ProductId) => Effect.Effect<Option.Option<Product>, ProductRepoError>;
  readonly getForItem: (itemId: ItemId) => Effect.Effect<Option.Option<Product>, ProductRepoError>;
  readonly list: Effect.Effect<readonly Product[], ProductRepoError>;
  readonly create: (input: ProductInput) => Effect.Effect<Product, ProductRepoError>;
};

/**
 * Service tag for the product repository.
 * @since 1.0.0
 */
export class ProductRepo extends Context.Tag('ProductRepo')<
  ProductRepo,
  ProductRepoShape
>() {}
