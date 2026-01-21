/**
 * Product handlers bridging GraphQL operations to repositories.
 * @since 1.0.0
 */
import { Effect, Option, Schema } from 'effect';
import type { ProductId } from '@lect-effect/domain/product/productId';
import { productIdInputSchema, type ProductIdInput } from '@lect-effect/domain/product/productIdInput';
import { productSchema } from '@lect-effect/domain/product/product';
import { productWithItemsSchema, type ProductWithItems } from '@lect-effect/domain/product/productWithItems';
import { productInputSchema, type ProductInput } from '@lect-effect/domain/product/productInput';
import { type Item, itemSchema } from '@lect-effect/domain/item/item';
import { createProductWithItemsInputSchema, type CreateProductWithItemsInput } from '@lect-effect/domain/product/createProductWithItemsInput';
import { ItemRepoService, type ItemRepoError } from '../services/itemRepo/interface.js';
import { ProductRepoService, type ProductRepoError } from '../services/productRepo/interface.js';
import { type QueryHandler, type MutationHandler, type FieldHandler } from './generic.js';

/**
 * Fetches a single product by id or returns null.
 * @since 1.0.0
 */
export const getProduct = (id: ProductId) =>
  Effect.gen(function * () {
    const repo = yield * ProductRepoService;
    const opt = yield * repo.getById(id);
    return Option.getOrNull(opt); // todo: wait this just swallows the ParseErrors?
  });

// todo: extract
const nullableProductSchema = Schema.NullOr(productSchema);
const emptyStructSchema = Schema.Struct({});
const productsArraySchema = Schema.Array(productSchema);
const itemsArraySchema = Schema.Array(itemSchema);
const nullableProductWithItemsSchema = Schema.NullOr(productWithItemsSchema);

/**
 * Query handler for fetching a single product.
 * @since 1.0.0
 */
export const getProductQuery: QueryHandler<
  typeof productIdInputSchema,
  typeof nullableProductSchema,
  ProductRepoError,
  ProductRepoService
> = {
  kind: 'query',
  key: 'getProduct',
  descriptionString: 'get product by id',
  inputSchema: productIdInputSchema,
  outputSchema: nullableProductSchema,
  handler: (input: ProductIdInput) => getProduct(input.id),
};

/**
 * Lists all products.
 * @since 1.0.0
 */
export const listProducts = Effect.gen(function * () {
  const repo = yield * ProductRepoService;
  return yield * repo.list;
});

/**
 * Query handler for listing products.
 * @since 1.0.0
 */
export const listProductsQuery: QueryHandler<
  typeof emptyStructSchema,
  typeof productsArraySchema,
  ProductRepoError,
  ProductRepoService
> = {
  kind: 'query',
  key: 'listProducts',
  descriptionString: 'list all products',
  inputSchema: emptyStructSchema,
  outputSchema: productsArraySchema,
  handler: () => listProducts,
};

/**
 * Creates a new product.
 * @since 1.0.0
 */
export const createProduct = (input: ProductInput) =>
  Effect.gen(function * () {
    const repo = yield * ProductRepoService;
    return yield * repo.create(input);
  });

/**
 * Mutation handler for creating a product.
 * @since 1.0.0
 */
export const createProductMutation: MutationHandler<
  typeof productInputSchema,
  typeof productSchema,
  ProductRepoError,
  ProductRepoService
> = {
  kind: 'mutation',
  key: 'createProduct',
  descriptionString: 'create product',
  inputSchema: productInputSchema,
  outputSchema: productSchema,
  handler: input => createProduct(input),
};

/**
 * Lists items for a given product id.
 * @since 1.0.0
 */
export const itemsForProduct = (productId: ProductId) =>
  Effect.gen(function * () {
    const items = yield * ItemRepoService;
    return yield * items.listForProduct(productId);
  });

/**
 * Field resolver for loading items for the parent product.
 * @since 1.0.0
 */
export const itemsForProductField: FieldHandler<
  typeof productSchema,
  typeof emptyStructSchema,
  typeof itemsArraySchema,
  ItemRepoError,
  ItemRepoService
> = {
  kind: 'field',
  parentSchema: productSchema,
  key: 'items',
  descriptionString: 'items for this product',
  inputSchema: emptyStructSchema,
  outputSchema: itemsArraySchema,
  handler: parent => itemsForProduct(parent.id),
};

/**
 * Fetches a product with its items, or null when missing.
 * @since 1.0.0
 */
export const getProductWithItems = (id: ProductId) =>
  Effect.gen(function * () {
    const productRepo = yield * ProductRepoService;
    const itemRepo = yield * ItemRepoService;

    const productOpt = yield * productRepo.getById(id);
    if (Option.isNone(productOpt)) {
      return null;
    }

    const items = yield * itemRepo.listForProduct(id);
    return { product: productOpt.value, items } satisfies ProductWithItems;
  });

/**
 * Query handler for fetching a product along with its items.
 * @since 1.0.0
 */
export const getProductWithItemsQuery: QueryHandler<
  typeof productIdInputSchema,
  typeof nullableProductWithItemsSchema,
  ProductRepoError | ItemRepoError,
  ProductRepoService | ItemRepoService
> = {
  kind: 'query',
  key: 'getProductWithItems',
  descriptionString: 'get product and its items by id',
  inputSchema: productIdInputSchema,
  outputSchema: nullableProductWithItemsSchema,
  handler: (input: ProductIdInput) => getProductWithItems(input.id),
};

/**
 * Creates a product and associated items, linking them.
 * @since 1.0.0
 */
export const createProductWithItems = (input: CreateProductWithItemsInput) =>
  Effect.gen(function * () {
    const productRepo = yield * ProductRepoService;
    const itemRepo = yield * ItemRepoService;

    const product = yield * productRepo.create(input.product);

    const items: Item[] = [];
    for (const itemInput of input.items) {
      const item = yield * itemRepo.create(itemInput);
      yield * itemRepo.linkToProduct(item.id, product.id);
      items.push(item);
    }

    return { product, items } satisfies ProductWithItems;
  });

/**
 * Mutation handler for creating a product and linking its items.
 * @since 1.0.0
 */
export const createProductWithItemsMutation: MutationHandler<
  typeof createProductWithItemsInputSchema,
  typeof productWithItemsSchema,
  ProductRepoError | ItemRepoError,
  ProductRepoService | ItemRepoService
> = {
  kind: 'mutation',
  key: 'createProductWithItems',
  descriptionString: 'create product and its items',
  inputSchema: createProductWithItemsInputSchema,
  outputSchema: productWithItemsSchema,
  handler: input => createProductWithItems(input),
};

/**
 * Registered product handlers for GraphQL resolver conversion.
 * @since 1.0.0
 */
export const productHandlers = [
  getProductQuery,
  listProductsQuery,
  createProductMutation,
  itemsForProductField,
  getProductWithItemsQuery,
  createProductWithItemsMutation,
];
