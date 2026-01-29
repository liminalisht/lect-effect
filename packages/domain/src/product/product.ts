/**
 * Product domain schema module.
 * @since 0.1.0
 */

import { Schema } from 'effect';
import { productIdSchema } from './productId.js';
import { productDescriptionSchema } from './productDescription.js';

/**
 * Product domain entity.
 * @since 0.1.0
 * @category Domain Types
 */
export type Product = Schema.Schema.Type<typeof productSchema>;

/**
 * Product schema used across persistence and GraphQL layers.
 * @since 0.1.0
 * @category Domain Schemas
 */
export const productSchema = Schema.Struct({
  __typename: Schema.optional(Schema.Literal('Product')),
  id: productIdSchema,
  description: Schema.NullOr(productDescriptionSchema).annotations({ description: 'product description (nullable)' }),
}).annotations({
  title: 'Product',
  description: 'product',
});
