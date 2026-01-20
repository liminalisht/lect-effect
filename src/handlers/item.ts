/**
 * Item handlers bridging GraphQL operations to item and product repositories.
 * @since 1.0.0
 */
import { Effect, Option, Schema } from 'effect';
import { ItemRepoService, type ItemRepoError } from '../services/itemRepo/interface.js';
import { ProductRepoService, type ProductRepoError } from '../services/productRepo/interface.js';
import type { ItemId } from '../domain/item/itemId.js';
import { itemSchema } from '../domain/item/item.js';
import { createItemInputSchema, type CreateItemInput } from '../domain/item/createItemInput.js';
import { type ItemIdInput, itemIdInputSchema } from '../domain/item/itemIdInput.js';
import { productSchema } from '../domain/product/product.js';
import { type QueryHandler, type FieldHandler, type MutationHandler } from './generic.js';

/**
 * Fetches an item by id.
 * @since 1.0.0
 */
export const getItem = (id: ItemId) =>
  Effect.gen(function * () {
    const repo = yield * ItemRepoService;
    return yield * repo.getById(id);
  });

// todo: move
const nullableItemSchema = Schema.NullOr(itemSchema);
const emptyStructSchema = Schema.Struct({});
const itemArraySchema = Schema.Array(itemSchema);
const nullableProductSchema = Schema.NullOr(productSchema);

/**
 * Query handler for fetching a single item.
 * @since 1.0.0
 */
export const getItemQuery: QueryHandler<
  typeof itemIdInputSchema,
  typeof nullableItemSchema,
  ItemRepoError,
  ItemRepoService
> = {
  kind: 'query',
  key: 'getItem',
  descriptionString: 'get item by id',
  inputSchema: itemIdInputSchema,
  outputSchema: nullableItemSchema,
  handler: (input: ItemIdInput) => getItem(input.id),
};

/**
 * Lists all items.
 * @since 1.0.0
 */
export const listItems = Effect.gen(function * () {
  const repo = yield * ItemRepoService;
  return yield * repo.list;
});

/**
 * Query handler for listing all items.
 * @since 1.0.0
 */
export const listItemsQuery: QueryHandler<
  typeof emptyStructSchema,
  typeof itemArraySchema,
  ItemRepoError,
  ItemRepoService
> = {
  kind: 'query',
  key: 'listItems',
  descriptionString: 'list all items',
  inputSchema: emptyStructSchema,
  outputSchema: itemArraySchema,
  handler: () => listItems,
};

/**
 * Creates a new item.
 * @since 1.0.0
 */
export const createItem = (input: CreateItemInput) =>
  Effect.gen(function * () {
    const repo = yield * ItemRepoService;
    return yield * repo.create(input);
  });

/**
 * Mutation handler for creating a new item.
 * @since 1.0.0
 */
export const createItemMutation: MutationHandler<
  typeof createItemInputSchema,
  typeof itemSchema,
  ItemRepoError,
  ItemRepoService
> = {
  kind: 'mutation',
  key: 'createItem',
  descriptionString: 'create a new item',
  inputSchema: createItemInputSchema,
  outputSchema: itemSchema,
  handler: input => createItem(input),
};

/**
 * Looks up the product for a given item id, returning null when absent.
 * @since 1.0.0
 */
export const productForItem = (itemId: ItemId) =>
  Effect.gen(function * () {
    const repo = yield * ProductRepoService;
    const opt = yield * repo.getForItem(itemId);
    return Option.getOrNull(opt);
  });

/**
 * Field resolver for loading the product related to an item.
 * @since 1.0.0
 */
export const productForItemField: FieldHandler<
  typeof itemSchema,
  typeof emptyStructSchema,
  typeof nullableProductSchema,
  ProductRepoError,
  ProductRepoService
> = {
  kind: 'field',
  parentSchema: itemSchema,
  key: 'product',
  descriptionString: 'product for this item',
  inputSchema: emptyStructSchema,
  outputSchema: nullableProductSchema,
  handler: parent => productForItem(parent.id),
};

/**
 * Registered item handlers for GraphQL resolver conversion.
 * @since 1.0.0
 */
export const itemHandlers = [
  getItemQuery,
  listItemsQuery,
  createItemMutation,
  productForItemField,
];
