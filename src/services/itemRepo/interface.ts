/**
 * Item repository service contract and live implementation.
 * @since 1.0.0
 */
import { Context, type Effect } from 'effect';
import type * as SqlError from '@effect/sql/SqlError';
import { type ParseError } from 'effect/ParseResult';
import { type CreateItemInput } from '../../domain/item/createItemInput.js';
import { type ItemId } from '../../domain/item/itemId.js';
import { type Item } from '../../domain/item/item.js';
import { type ProductId } from '../../domain/product/productId.js';

// todo: extract error
/**
 * Error type union for item repository operations.
 * @since 1.0.0
 */
export type ItemRepoError = SqlError.SqlError | ParseError;

/**
 * Interface for item repository capabilities.
 * @since 1.0.0
 */
export type ItemRepoShape = {
  readonly getById: (id: ItemId) => Effect.Effect<Item | null, ItemRepoError>;
  readonly list: Effect.Effect<readonly Item[], ItemRepoError>;
  readonly create: (input: CreateItemInput) => Effect.Effect<Item, ItemRepoError>;
  readonly listForProduct: (productId: ProductId) => Effect.Effect<readonly Item[], ItemRepoError>;
  readonly linkToProduct: (itemId: ItemId, productId: ProductId) => Effect.Effect<void, ItemRepoError>;
};

/**
 * Service tag for the item repository.
 * @since 1.0.0
 */
export class ItemRepoService extends Context.Tag('services/itemRepo')<ItemRepoService, ItemRepoShape>() {}
