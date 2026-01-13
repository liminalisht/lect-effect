/**
 * Product handlers bridging GraphQL operations to repositories.
 * @since 1.0.0
 */
import { Effect, Option } from 'effect';
import { ProductRepo } from '../services/productRepo';
import { ItemRepo } from '../services/itemRepo';
import type { ProductId } from '../domain/product/productId';
import type { ProductInput } from '../domain/product/productInput';
import type { Item } from '../domain/item/item';
import type { CreateProductWithItemsInput } from '../domain/product/createProductWithItemsInput';
import type { ProductWithItems } from '../domain/product/productWithItems';

/**
 * Fetches a single product by id or returns null.
 * @since 1.0.0
 */
export const getProduct = (id: ProductId) =>
  Effect.gen(function * () {
    const repo = yield * ProductRepo;
    const opt = yield * repo.getById(id);
    return Option.getOrNull(opt); // todo: wait this just swallows the ParseErrors?
  });

/**
 * Lists all products.
 * @since 1.0.0
 */
export const listProducts = Effect.gen(function * () {
  const repo = yield * ProductRepo;
  return yield * repo.list;
});

/**
 * Creates a new product.
 * @since 1.0.0
 */
export const createProduct = (input: ProductInput) =>
  Effect.gen(function * () {
    const repo = yield * ProductRepo;
    return yield * repo.create(input);
  });

/**
 * Lists items for a given product id.
 * @since 1.0.0
 */
export const itemsForProduct = (productId: ProductId) =>
  Effect.gen(function * () {
    const items = yield * ItemRepo;
    return yield * items.listForProduct(productId);
  });

/**
 * Fetches a product with its items, or null when missing.
 * @since 1.0.0
 */
export const getProductWithItems = (id: ProductId) =>
  Effect.gen(function * () {
    const productRepo = yield * ProductRepo;
    const itemRepo = yield * ItemRepo;

    const productOpt = yield * productRepo.getById(id);
    if (Option.isNone(productOpt)) {
      return null;
    }

    const items = yield * itemRepo.listForProduct(id);
    return { product: productOpt.value, items } satisfies ProductWithItems;
  });

/**
 * Creates a product and associated items, linking them.
 * @since 1.0.0
 */
export const createProductWithItems = (input: CreateProductWithItemsInput) =>
  Effect.gen(function * () {
    const productRepo = yield * ProductRepo;
    const itemRepo = yield * ItemRepo;

    const product = yield * productRepo.create(input.product);

    const items: Item[] = [];
    for (const itemInput of input.items) {
      const item = yield * itemRepo.create(itemInput);
      yield * itemRepo.linkToProduct(item.id, product.id);
      items.push(item);
    }

    return { product, items } satisfies ProductWithItems;
  });
