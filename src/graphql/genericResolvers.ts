import { resolver } from '@gqloom/core';
import { Effect, Schema } from 'effect';
import { genericFieldResolver, genericMutationResolver, genericQueryResolver } from './generic';
import { productSchema, type Product } from '../domain/product/product';
import { itemSchema, type Item } from '../domain/item/item';
import { getProduct, itemsForProduct } from '../handlers/product';
import { productIdSchema } from '../domain/product/productId';
import { productIdInputSchema } from '../domain/product/productIdInput';

// Field resolver: Product.items -> [Item]
const productItemsResolver = genericFieldResolver(
  'items',                              // field key
  'Items belonging to the product',     // description
  productSchema,                        // parent schema (Product)
  Schema.Struct({}),                    // input schema
  Schema.Array(itemSchema),             // output schema (Item[])
  (parent: Product) => itemsForProduct(parent.id) // Effect<Item[]>
);

// Query resolver: product(id) -> Product
const productQueryResolver = genericQueryResolver(
  'product',
  'Find product by id',
  productIdInputSchema, // input schema
  Schema.NullOr(productSchema),                        // output schema
  (input) => getProduct(input.id)
);

// Combine them into one resolver
export const exampleResolvers = [
  productQueryResolver,
  productItemsResolver,
]
