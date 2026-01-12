import { Effect, Option } from 'effect';
import { ProductRepo } from '../services/productRepo';
import { ItemRepo } from '../services/itemRepo';
import type { ProductId, ProductInput } from '../domain/product';
import type { CreateProductWithItemsInput, ProductWithItems } from '../domain/productWithItems';

export const getProduct = (id: ProductId) =>
  Effect.gen(function * () {
    const repo = yield * ProductRepo;
    const opt = yield * repo.getById(id);
    return Option.getOrNull(opt);
  });

export const listProducts = Effect.gen(function * () {
  const repo = yield * ProductRepo;
  return yield * repo.list;
});

export const createProduct = (input: ProductInput) =>
  Effect.gen(function * () {
    const repo = yield * ProductRepo;
    return yield * repo.create(input);
  });

export const itemsForProduct = (productId: ProductId) =>
  Effect.gen(function * () {
    const items = yield * ItemRepo;
    return yield * items.listForProduct(productId);
  });

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

export const createProductWithItems = (input: CreateProductWithItemsInput) =>
  Effect.gen(function * () {
    const productRepo = yield * ProductRepo;
    const itemRepo = yield * ItemRepo;

    const product = yield * productRepo.create(input.product);

    const items = yield * Effect.forEach(input.items, itemInput =>
      Effect.gen(function * () {
        const item = yield * itemRepo.create(itemInput);
        yield * itemRepo.linkToProduct(item.id, product.id);
        return item;
      }));

    return { product, items } satisfies ProductWithItems;
  });
