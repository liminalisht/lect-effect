/**
 * Product id input module.
 * @since 0.1.0
 */
import { Schema } from 'effect';
import { productIdSchema } from './productId.js';

/**
 * GraphQL input for selecting a product by id.
 * @since 0.1.0
 * @category Domain Types
 */
export type ProductIdInput = Schema.Schema.Type<typeof productIdInputSchema>;
/**
 * Input schema for selecting a product by id.
 * @since 0.1.0
 * @category Domain Schemas
 */
export const productIdInputSchema = Schema.Struct({
  id: productIdSchema,
});

