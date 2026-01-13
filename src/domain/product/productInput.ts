import { Schema } from 'effect';
import { productDescriptionSchema } from './productDescription';

/**
 * GraphQL input for creating or updating a product.
 * @since 1.0.0
 */
export type ProductInput = Schema.Schema.Type<typeof productInputSchema>;
/**
 * Input schema for creating or updating a product.
 * @since 1.0.0
 */
export const productInputSchema = Schema.Struct({
  // nullable + optional, matching old `z.string().nullable().optional()`
  description: Schema.optional(Schema.NullOr(productDescriptionSchema)).annotations({ description: 'product description (nullable & optional)' }),
});
