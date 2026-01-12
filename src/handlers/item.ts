/**
 * Item handlers bridging GraphQL operations to item and product repositories.
 * @since 1.0.0
 */
import { Effect, Option } from 'effect';
import { ItemRepo } from '../services/itemRepo';
import { ProductRepo } from '../services/productRepo';
import type { ItemId, ItemInput } from '../domain/item';

/**
 * Fetches an item by id.
 * @since 1.0.0
 */
export const getItem = (id: ItemId) =>
  Effect.gen(function * () {
    const repo = yield * ItemRepo;
    return yield * repo.getById(id);
  });

/**
 * Lists all items.
 * @since 1.0.0
 */
export const listItems = Effect.gen(function * () {
  const repo = yield * ItemRepo;
  return yield * repo.list;
});

/**
 * Creates a new item.
 * @since 1.0.0
 */
export const createItem = (input: ItemInput) =>
  Effect.gen(function * () {
    const repo = yield * ItemRepo;
    return yield * repo.create(input);
  });

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
