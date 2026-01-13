/**
 * GraphQL product query resolvers.
 * @since 1.0.0
 */
// // todo: add tests for resolvers
import { field, query, resolver } from '@gqloom/core';
import { Schema } from 'effect';
import { runEffect } from '../../effect';
import * as handlers from '../../../handlers/product';
import { productIdInputSchema } from '../../../domain/product/productIdInput';
import { productSchema } from '../../../domain/product/product';
import { productWithItemsSchema } from '../../../domain/product/productWithItems';

/**
 * Query for fetching a product by id.
 * @since 1.0.0
 */
export const productQuery
  = query(Schema.standardSchemaV1(Schema.NullOr(productSchema)))
    .input(Schema.standardSchemaV1(productIdInputSchema))
    .resolve(async args => runEffect(handlers.getProduct(args.id)));

/**
 * Query for listing products.
 * @since 1.0.0
 */
export const productsQuery
  = query(Schema.standardSchemaV1(Schema.Array(productSchema)))
    .resolve(async () => runEffect(handlers.listProducts));

/**
 * Query for fetching a product and its items.
 * @since 1.0.0
 */
export const productWithItemsQuery
  = query(Schema.standardSchemaV1(Schema.NullOr(productWithItemsSchema)))
    .input(Schema.standardSchemaV1(productIdInputSchema))
    .resolve(async args => runEffect(handlers.getProductWithItems(args.id)));

/**
 * Map of product queries.
 * @since 1.0.0
 */
export const productQueryMap = {
  product: productQuery,
  products: productsQuery,
  productWithItems: productWithItemsQuery,
};

/**
 * Resolver for product queries.
 * @since 1.0.0
 */
export const productQueryResolvers = resolver(productQueryMap);

