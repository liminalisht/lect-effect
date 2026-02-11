/**
 * Product input module for create/update operations.
 * @since 0.1.0
 */
import { Schema } from 'effect';
import { productDescriptionSchema } from './productDescription.js';

/**
 * GraphQL input for creating or updating a product.
 * @since 0.1.0
 * @category Domain Types
 */
export type ProductInput = Schema.Schema.Type<typeof productInputSchema>;
/**
 * Input schema for creating or updating a product.
 * @since 0.1.0
 * @category Domain Schemas
 */
export const productInputSchema = Schema.Struct({
  // nullable + optional, matching old `z.string().nullable().optional()`
  description: Schema.optionalWith(Schema.NullOr(productDescriptionSchema), {
    default: () => null,
  }).annotations({ description: 'product description (nullable & optional, defaults null)' }),
});
