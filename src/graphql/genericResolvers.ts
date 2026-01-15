import { resolver } from '@gqloom/core';
import { Effect, Schema } from 'effect';
import { genericFieldResolver, genericMutationResolver, genericQueryResolver, handlersToResolvers } from './generic';
import { productSchema, type Product } from '../domain/product/product';
import { itemSchema, type Item } from '../domain/item/item';
import { getProduct, itemsForProduct } from '../handlers/product';
import { productIdSchema } from '../domain/product/productId';
import { productIdInputSchema } from '../domain/product/productIdInput';

// Combine them into one resolver
export const exampleResolvers = handlersToResolvers([
  {
    kind: 'field',
    parentSchema: productSchema,
    key: 'items',
    descriptionString: 'items belonging to the product',
    inputSchema: Schema.Struct({}),
    outputSchema: Schema.Array(itemSchema),
    handler: (parent: Product) => itemsForProduct(parent.id)
  },
  {
    kind: 'query',
    key: 'product',
    descriptionString: 'find product by id',
    inputSchema: productIdInputSchema,
    outputSchema: Schema.NullOr(productSchema),
    handler: (input) => getProduct(input.id)
  },
]);
