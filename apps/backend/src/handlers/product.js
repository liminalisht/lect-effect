/**
 * Product handlers bridging GraphQL operations to repositories.
 * @since 1.0.0
 */
import { Effect, Option, Schema } from 'effect';
import { productIdInputSchema } from '@lect-effect/domain/product/productIdInput';
import { productSchema } from '@lect-effect/domain/product/product';
import { productWithItemsSchema } from '@lect-effect/domain/product/productWithItems';
import { productInputSchema } from '@lect-effect/domain/product/productInput';
import { itemSchema } from '@lect-effect/domain/item/item';
import { createProductWithItemsInputSchema } from '@lect-effect/domain/product/createProductWithItemsInput';
import { ItemRepoService } from '../services/itemRepo/interface.js';
import { ProductRepoService } from '../services/productRepo/interface.js';
/**
 * Fetches a single product by id or returns null.
 * @since 1.0.0
 * @category Product Handler Effects
 */
export const getProduct = (id) => Effect.gen(function* () {
    const repo = yield* ProductRepoService;
    const opt = yield* repo.getById(id);
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
 * @category Product Handlers
 */
export const getProductQuery = {
    kind: 'query',
    key: 'getProduct',
    descriptionString: 'get product by id',
    inputSchema: productIdInputSchema,
    outputSchema: nullableProductSchema,
    handler: (input) => getProduct(input.id),
};
/**
 * Lists all products.
 * @since 1.0.0
 * @category Product Handler Effects
 */
export const listProducts = Effect.gen(function* () {
    const repo = yield* ProductRepoService;
    return yield* repo.list;
});
/**
 * Query handler for listing products.
 * @since 1.0.0
 * @category Product Handlers
 */
export const listProductsQuery = {
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
 * @category Product Handler Effects
 */
export const createProduct = (input) => Effect.gen(function* () {
    const repo = yield* ProductRepoService;
    return yield* repo.create(input);
});
/**
 * Mutation handler for creating a product.
 * @since 1.0.0
 * @category Product Handlers
 */
export const createProductMutation = {
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
 * @category Product Handler Effects
 */
export const itemsForProduct = (productId) => Effect.gen(function* () {
    const items = yield* ItemRepoService;
    return yield* items.listForProduct(productId);
});
/**
 * Field resolver for loading items for the parent product.
 * @since 1.0.0
 * @category Product Handlers
 */
export const itemsForProductField = {
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
 * @category Product Handler Effects
 */
export const getProductWithItems = (id) => Effect.gen(function* () {
    const productRepo = yield* ProductRepoService;
    const itemRepo = yield* ItemRepoService;
    const productOpt = yield* productRepo.getById(id);
    if (Option.isNone(productOpt)) {
        return null;
    }
    const items = yield* itemRepo.listForProduct(id);
    return { product: productOpt.value, items };
});
/**
 * Query handler for fetching a product along with its items.
 * @since 1.0.0
 * @category Product Handlers
 */
export const getProductWithItemsQuery = {
    kind: 'query',
    key: 'getProductWithItems',
    descriptionString: 'get product and its items by id',
    inputSchema: productIdInputSchema,
    outputSchema: nullableProductWithItemsSchema,
    handler: (input) => getProductWithItems(input.id),
};
/**
 * Creates a product and associated items, linking them.
 * @since 1.0.0
 * @category Product Handler Effects
 */
export const createProductWithItems = (input) => Effect.gen(function* () {
    const productRepo = yield* ProductRepoService;
    const itemRepo = yield* ItemRepoService;
    const product = yield* productRepo.create(input.product);
    const items = [];
    for (const itemInput of input.items) {
        const item = yield* itemRepo.create(itemInput);
        yield* itemRepo.linkToProduct(item.id, product.id);
        items.push(item);
    }
    return { product, items };
});
/**
 * Mutation handler for creating a product and linking its items.
 * @since 1.0.0
 * @category Product Handlers
 */
export const createProductWithItemsMutation = {
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
 * @category Product Handlers
 */
export const productHandlers = [
    getProductQuery,
    listProductsQuery,
    createProductMutation,
    itemsForProductField,
    getProductWithItemsQuery,
    createProductWithItemsMutation,
];
