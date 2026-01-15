import { Schema } from 'effect';
import { productSchema, type Product } from '../domain/product/product';
import { itemSchema } from '../domain/item/item';
import { getProduct, itemsForProduct } from '../handlers/product';
import { handlersToResolvers } from './generic';
import { ProductIdInput, productIdInputSchema } from '../domain/product/productIdInput';

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
    handler: (input : ProductIdInput) => getProduct(input.id)
  },
]);
