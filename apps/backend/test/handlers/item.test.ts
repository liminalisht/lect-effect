import { Arbitrary, Effect, Option } from 'effect';
import { it } from '@effect/vitest';
import { describe, expect } from 'vitest';
import * as fc from 'fast-check';
import { itemIdSchema } from '@lect-effect/domain/item/itemId';
import { itemSchema } from '@lect-effect/domain/item/item';
import { createItemInputSchema } from '@lect-effect/domain/item/createItemInput';
import { productSchema } from '@lect-effect/domain/product/product';
import { productIdSchema } from '@lect-effect/domain/product/productId';
import { ProductRepoService, type ProductRepoShape } from '../../src/services/productRepo/interface.js';
import { ItemRepoService, type ItemRepoShape } from '../../src/services/itemRepo/interface.js';
import {
  createItem,
  getItem,
  listItems,
  productForItem,
} from '../../src/handlers/item.js';

const arbitraryItemId = Arbitrary.make(itemIdSchema);
const arbitraryItem = Arbitrary.make(itemSchema);
const arbitraryItemList = fc.array(arbitraryItem, { maxLength: 5 });
const arbitraryCreateItemInput = Arbitrary.make(createItemInputSchema);
const arbitraryProduct = Arbitrary.make(productSchema);
const arbitraryProductId: fc.Arbitrary<number> = Arbitrary.make(productIdSchema);

const unusedItemRepo: Omit<ItemRepoShape, 'getById'> = {
  list: Effect.dieMessage('list unused') as unknown as ItemRepoShape['list'],
  create: (() => Effect.dieMessage('create unused')) as ItemRepoShape['create'],
  listForProduct: (() => Effect.dieMessage('listForProduct unused')) as ItemRepoShape['listForProduct'],
  linkToProduct: (() => Effect.dieMessage('linkToProduct unused')) as ItemRepoShape['linkToProduct'],
};

const unusedProductRepo: Omit<ProductRepoShape, 'getForItem'> = {
  getById: (() => Effect.dieMessage('getById unused')) as ProductRepoShape['getById'],
  list: Effect.dieMessage('list unused') as unknown as ProductRepoShape['list'],
  create: (() => Effect.dieMessage('create unused')) as ProductRepoShape['create'],
};

describe('item handlers', () => {
  it.effect('getItem returns repository result', () =>
    Effect.promise(async () => fc.assert(fc.asyncProperty(arbitraryItemId, fc.oneof(fc.constant(null), arbitraryItem), async (id, found) => {
      const repo: ItemRepoShape = {
        ...unusedItemRepo,
        getById(inputId) {
          expect(inputId).toEqual(id);
          return Effect.succeed(found);
        },
      };

      const result = await Effect.runPromise(getItem(id).pipe(Effect.provideService(ItemRepoService, repo)));
      expect(result).toEqual(found);
    }))));

  it.effect('listItems returns repository list', () =>
    Effect.promise(async () => fc.assert(fc.asyncProperty(arbitraryItemList, async items => {
      const repo: ItemRepoShape = {
        getById: () => Effect.dieMessage('getById unused'),
        ...unusedItemRepo,
        list: Effect.succeed(items),
      };

      const result = await Effect.runPromise(listItems.pipe(Effect.provideService(ItemRepoService, repo)));
      expect(result).toEqual(items);
    }))));

  it.effect('createItem forwards input to repository', () =>
    Effect.promise(async () => fc.assert(fc.asyncProperty(arbitraryCreateItemInput, arbitraryItem, async (input, created) => {
      const repo: ItemRepoShape = {
        getById: () => Effect.dieMessage('getById unused'),
        ...unusedItemRepo,
        create(repoInput) {
          expect(repoInput).toEqual(input);
          return Effect.succeed(created);
        },
      };

      const result = await Effect.runPromise(createItem(input).pipe(Effect.provideService(ItemRepoService, repo)));
      expect(result).toEqual(created);
    }))));

  it.effect('productForItem returns nullable product', () =>
    Effect.promise(async () => fc.assert(fc.asyncProperty(arbitraryProductId, fc.oneof(fc.constant(null), arbitraryProduct), async (itemId, product) => {
      const repo: ProductRepoShape = {
        ...unusedProductRepo,
        getForItem(inputId) {
          expect(inputId).toEqual(itemId);
          return Effect.succeed(Option.fromNullable(product));
        },
      };

      const result = await Effect.runPromise(productForItem(itemId).pipe(Effect.provideService(ProductRepoService, repo)));
      expect(result).toEqual(product);
    }))));
});
