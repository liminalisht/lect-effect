/**
 * Product domain schema module.
 * @since 1.0.0
 */

import { Schema } from 'effect';
import { productIdSchema } from './productId';
import { productDescriptionSchema } from './productDescription';

/**
 * Product domain entity.
 * @since 1.0.0
 */
export type Product = Schema.Schema.Type<typeof productSchema>;

/**
 * Product schema used across persistence and GraphQL layers.
 * @since 1.0.0
 */
export const productSchema = Schema.Struct({
  __typename: Schema.optional(Schema.Literal('Product')),
  id: productIdSchema,
  description: Schema.NullOr(productDescriptionSchema).annotations({ description: 'product description (nullable)' }),
}).annotations({
  title: 'Product',
  description: 'product',
});
