/**
 * Item handlers bridging GraphQL operations to item and product repositories.
 * @since 1.0.0
 */
import { Effect, Option, Schema } from 'effect';
import { ItemRepo, type ItemRepoError } from '../services/interfaces/itemRepo';
import { ProductRepo, type ProductRepoError } from '../services/interfaces/productRepo';
import type { ItemId } from '../domain/item/itemId';
import { itemSchema } from '../domain/item/item';
import { createItemInputSchema, type CreateItemInput } from '../domain/item/createItemInput';
import { type ItemIdInput, itemIdInputSchema } from '../domain/item/itemIdInput';
import { productSchema } from '../domain/product/product';
import { type QueryHandler, type FieldHandler, type MutationHandler } from './generic';

/**
 * Fetches an item by id.
 * @since 1.0.0
 */
export const getItem = (id: ItemId) =>
  Effect.gen(function * () {
    const repo = yield * ItemRepo;
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
  ItemRepo
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
  const repo = yield * ItemRepo;
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
  ItemRepo
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
    const repo = yield * ItemRepo;
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
  ItemRepo
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
    const repo = yield * ProductRepo;
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
  ProductRepo
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
