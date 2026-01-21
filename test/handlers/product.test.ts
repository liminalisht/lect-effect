import { Arbitrary, Effect, Option } from 'effect';
import { it } from '@effect/vitest';
import { describe, expect } from 'vitest';
import * as fc from 'fast-check';
import { productSchema, type Product } from '@lect-effect/domain/product/product';
import { productIdSchema } from '@lect-effect/domain/product/productId';
import { productInputSchema } from '@lect-effect/domain/product/productInput';
import { itemSchema, type Item } from '@lect-effect/domain/item/item';
import { itemIdSchema } from '@lect-effect/domain/item/itemId';
import { createProductWithItemsInputSchema } from '@lect-effect/domain/product/createProductWithItemsInput';
import { ItemRepoService, type ItemRepoShape } from '../../src/services/itemRepo/interface.js';
import { ProductRepoService, type ProductRepoShape } from '../../src/services/productRepo/interface.js';
import {
  createProduct,
  createProductWithItems,
  getProduct,
  getProductWithItems,
  itemsForProduct,
  listProducts,
} from '../../src/handlers/product.js';

const arbitraryProductId: fc.Arbitrary<number> = Arbitrary.make(productIdSchema);
const arbitraryProduct = Arbitrary.make(productSchema);
const arbitraryProductList = fc.array(arbitraryProduct, { maxLength: 5 });
const arbitraryProductInput = Arbitrary.make(productInputSchema);
const arbitraryItem = Arbitrary.make(itemSchema);
const arbitraryItemList = fc.array(arbitraryItem, { maxLength: 5 });
const arbitraryItemId = Arbitrary.make(itemIdSchema);
const arbitraryCreateProductWithItemsInput = Arbitrary.make(createProductWithItemsInputSchema);

describe('product handlers', () => {
  it.effect('getProduct returns nullable product', () =>
    Effect.promise(async () => fc.assert(fc.asyncProperty(arbitraryProductId, fc.oneof(fc.constant(null), arbitraryProduct), async (id, productData) => {
      const product = productData === null ? null : { ...productData, id };
      const repo: ProductRepoShape = {
        getById(inputId) {
          expect(inputId).toEqual(id);
          return Effect.succeed(Option.fromNullable(product));
        },
        getForItem: () => Effect.dieMessage('getForItem unused'),
        list: Effect.dieMessage('list unused') as unknown as ProductRepoShape['list'],
        create: (() => Effect.dieMessage('create unused')) as ProductRepoShape['create'],
      };

      const result = await Effect.runPromise(getProduct(id).pipe(Effect.provideService(ProductRepoService, repo)));
      expect(result).toEqual(product);
    }))));

  it.effect('listProducts returns repository list', () =>
    Effect.promise(async () => fc.assert(fc.asyncProperty(arbitraryProductList, async products => {
      const repo: ProductRepoShape = {
        getById: () => Effect.dieMessage('getById unused'),
        getForItem: () => Effect.dieMessage('getForItem unused'),
        list: Effect.succeed(products),
        create: (() => Effect.dieMessage('create unused')) as ProductRepoShape['create'],
      };

      const result = await Effect.runPromise(listProducts.pipe(Effect.provideService(ProductRepoService, repo)));
      expect(result).toEqual(products);
    }))));

  it.effect('createProduct forwards input to repository', () =>
    Effect.promise(async () => fc.assert(fc.asyncProperty(arbitraryProductInput, arbitraryProductId, arbitraryProduct, async (input, id, productData) => {
      const created = { ...productData, id, description: input.description ?? null };
      const repo: ProductRepoShape = {
        getById: () => Effect.dieMessage('getById unused'),
        getForItem: () => Effect.dieMessage('getForItem unused'),
        list: Effect.dieMessage('list unused') as unknown as ProductRepoShape['list'],
        create(repoInput) {
          expect(repoInput).toEqual(input);
          return Effect.succeed(created);
        },
      };

      const result = await Effect.runPromise(createProduct(input).pipe(Effect.provideService(ProductRepoService, repo)));
      expect(result).toEqual(created);
    }))));

  it.effect('itemsForProduct returns repository items', () =>
    Effect.promise(async () => fc.assert(fc.asyncProperty(arbitraryProductId, arbitraryItemList, async (productId, items) => {
      const itemRepo: ItemRepoShape = {
        getById: () => Effect.dieMessage('getById unused'),
        list: Effect.dieMessage('list unused') as unknown as ItemRepoShape['list'],
        create: (() => Effect.dieMessage('create unused')) as ItemRepoShape['create'],
        listForProduct(inputId) {
          expect(inputId).toEqual(productId);
          return Effect.succeed(items);
        },
        linkToProduct: (() => Effect.dieMessage('linkToProduct unused')) as ItemRepoShape['linkToProduct'],
      };

      const result = await Effect.runPromise(itemsForProduct(productId).pipe(Effect.provideService(ItemRepoService, itemRepo)));
      expect(result).toEqual(items);
    }))));

  it.effect('getProductWithItems returns aggregate or null', () =>
    Effect.promise(async () => fc.assert(fc.asyncProperty(arbitraryProductId, arbitraryProduct, arbitraryItemList, fc.boolean(), async (productId, productData, items, hasProduct) => {
      const product = { ...productData, id: productId };
      const productRepo: ProductRepoShape = {
        getById(inputId) {
          expect(inputId).toEqual(productId);
          return Effect.succeed(Option.fromNullable(hasProduct ? product : null));
        },
        getForItem: () => Effect.dieMessage('getForItem unused'),
        list: Effect.dieMessage('list unused') as unknown as ProductRepoShape['list'],
        create: (() => Effect.dieMessage('create unused')) as ProductRepoShape['create'],
      };

      const itemRepo: ItemRepoShape = {
        getById: () => Effect.dieMessage('getById unused'),
        list: Effect.dieMessage('list unused') as unknown as ItemRepoShape['list'],
        create: (() => Effect.dieMessage('create unused')) as ItemRepoShape['create'],
        listForProduct: () => (hasProduct ? Effect.succeed(items) : Effect.dieMessage('listForProduct should not be called')),
        linkToProduct: (() => Effect.dieMessage('linkToProduct unused')) as ItemRepoShape['linkToProduct'],
      };

      const result = await Effect.runPromise(getProductWithItems(productId).pipe(
        Effect.provideService(ProductRepoService, productRepo),
        Effect.provideService(ItemRepoService, itemRepo),
      ));

      if (hasProduct) {
        expect(result).toEqual({ product, items });
      } else {
        expect(result).toBeNull();
      }
    }))));

  it.effect('createProductWithItems wires creation and linking', () =>
    Effect.promise(async () => fc.assert(fc.asyncProperty(arbitraryCreateProductWithItemsInput, arbitraryProductId, arbitraryItemId, async (input, productId, startingItemId) => {
      let nextItemId: number = startingItemId;
      const createdItems: Item[] = [];
      const links: Array<{itemId: Item['id']; productId: typeof productId}> = [];

      const createdProduct: Product = { id: productId, __typename: 'Product', description: input.product.description ?? null };

      const productRepo: ProductRepoShape = {
        getById: () => Effect.dieMessage('getById unused'),
        getForItem: () => Effect.dieMessage('getForItem unused'),
        list: Effect.dieMessage('list unused') as unknown as ProductRepoShape['list'],
        create(repoInput) {
          expect(repoInput).toEqual(input.product);
          return Effect.succeed(createdProduct);
        },
      };

      const itemRepo: ItemRepoShape = {
        getById: () => Effect.dieMessage('getById unused'),
        list: Effect.dieMessage('list unused') as unknown as ItemRepoShape['list'],
        create(repoInput) {
          const item = { id: nextItemId, description: repoInput.description ?? null, pack_size: repoInput.pack_size };
          nextItemId += 1;
          createdItems.push(item);
          return Effect.succeed(item);
        },
        listForProduct: () => Effect.dieMessage('listForProduct unused'),
        linkToProduct(itemId, linkedProductId) {
          links.push({ itemId, productId: linkedProductId });
          return Effect.succeed(undefined);
        },
      };

      const result = await Effect.runPromise(createProductWithItems(input).pipe(
        Effect.provideService(ProductRepoService, productRepo),
        Effect.provideService(ItemRepoService, itemRepo),
      ));

      expect(result).toEqual({ product: createdProduct, items: createdItems });
      expect(links).toEqual(createdItems.map(item => ({ itemId: item.id, productId })));
    }))));
});
