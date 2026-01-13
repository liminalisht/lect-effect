import { Schema } from 'effect';
import { productIdSchema } from './productId';

/**
 * GraphQL input for selecting a product by id.
 * @since 1.0.0
 */
export type ProductIdInput = Schema.Schema.Type<typeof productIdInputSchema>;
/**
 * Input schema for selecting a product by id.
 * @since 1.0.0
 */
export const productIdInputSchema = Schema.Struct({
  id: productIdSchema,
});

