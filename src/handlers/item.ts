/**
 * Item handlers bridging GraphQL operations to item and product repositories.
 * @since 1.0.0
 */
import { Effect, Option, Schema } from 'effect';
import { ItemRepo, ItemRepoError } from '../services/itemRepo';
import { ProductRepo, type ProductRepoError } from '../services/productRepo';
import type { ItemId } from '../domain/item/itemId';
import { itemSchema } from '../domain/item/item';
import { createItemInputSchema, type CreateItemInput } from '../domain/item/createItemInput';
import { QueryHandler, FieldHandler, MutationHandler } from './generic';
import { ItemIdInput, itemIdInputSchema } from '../domain/item/itemIdInput';
import { productSchema } from '../domain/product/product';

/**
 * Fetches an item by id.
 * @since 1.0.0
 */
export const getItem = (id: ItemId) =>
  Effect.gen(function * () {
    const repo = yield * ItemRepo;
    return yield * repo.getById(id);
  });

//todo: move
const nullableItemSchema = Schema.NullOr(itemSchema);
const emptyStructSchema = Schema.Struct({});
const itemArraySchema = Schema.Array(itemSchema);
const nullableProductSchema = Schema.NullOr(productSchema);

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
  handler: (input) => createItem(input),
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
  handler: (parent) => productForItem(parent.id),
};

export const itemHandlers = [
  getItemQuery,
  listItemsQuery,
  createItemMutation,
  productForItemField,
]
