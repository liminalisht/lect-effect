/**
 * Item handlers bridging GraphQL operations to item and product repositories.
 * @since 0.1.0
 */
import { Effect, Option, Schema } from 'effect';
import type { ItemId } from '@lect-effect/domain/item/itemId';
import { itemSchema } from '@lect-effect/domain/item/item';
import { createItemInputSchema, type CreateItemInput } from '@lect-effect/domain/item/createItemInput';
import { type ItemIdInput, itemIdInputSchema } from '@lect-effect/domain/item/itemIdInput';
import { productSchema } from '@lect-effect/domain/product/product';
import { ProductRepoService, type ProductRepoError } from '@lect-effect/services/productRepo';
import { ItemRepoService, type ItemRepoError } from '@lect-effect/services/itemRepo';
import { type QueryHandler, type FieldHandler, type MutationHandler } from './generic.js';

/**
 * Fetches an item by id.
 * @since 0.1.0
 * @category Item Handler Effects
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
 * @since 0.1.0
 * @category Item Handlers
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
 * @since 0.1.0
 * @category Item Handler Effects
 */
export const listItems = Effect.gen(function * () {
  const repo = yield * ItemRepoService;
  return yield * repo.list;
});

/**
 * Query handler for listing all items.
 * @since 0.1.0
 * @category Item Handlers
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
 * @since 0.1.0
 * @category Item Handler Effects
 */
export const createItem = (input: CreateItemInput) =>
  Effect.gen(function * () {
    const repo = yield * ItemRepoService;
    return yield * repo.create(input);
  });

/**
 * Mutation handler for creating a new item.
 * @since 0.1.0
 * @category Item Handlers
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
 * @since 0.1.0
 * @category Item Handler Effects
 */
export const productForItem = (itemId: ItemId) =>
  Effect.gen(function * () {
    const repo = yield * ProductRepoService;
    const opt = yield * repo.getForItem(itemId);
    return Option.getOrNull(opt);
  });

/**
 * Field resolver for loading the product related to an item.
 * @since 0.1.0
 * @category Item Handlers
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
 * @since 0.1.0
 * @category Item Handlers
 */
export const itemHandlers = [
  getItemQuery,
  listItemsQuery,
  createItemMutation,
  productForItemField,
];
