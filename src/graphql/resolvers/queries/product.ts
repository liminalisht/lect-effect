// // todo: add tests for resolvers
import { field, query, resolver } from '@gqloom/core';
import { Schema } from 'effect';
import { runEffect } from '../../effect';
import * as handlers from '../../../handlers/product';
import { productIdInputSchema } from '../../../domain/product/productIdInput';
import { productSchema } from '../../../domain/product/product';
import { productWithItemsSchema } from '../../../domain/product/productWithItems';

export const productQuery
  = query(Schema.standardSchemaV1(Schema.NullOr(productSchema)))
    .input(Schema.standardSchemaV1(productIdInputSchema))
    .resolve(async args => runEffect(handlers.getProduct(args.id)));

export const productsQuery
  = query(Schema.standardSchemaV1(Schema.Array(productSchema)))
    .resolve(async () => runEffect(handlers.listProducts));

export const productWithItemsQuery
  = query(Schema.standardSchemaV1(Schema.NullOr(productWithItemsSchema)))
    .input(Schema.standardSchemaV1(productIdInputSchema))
    .resolve(async args => runEffect(handlers.getProductWithItems(args.id)));

export const productQueryMap = {
  product: productQuery,
  products: productsQuery,
  productWithItems: productWithItemsQuery,
};

export const productQueryResolvers = resolver(productQueryMap);

