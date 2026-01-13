/**
 * Product-with-items creation input module.
 * @since 1.0.0
 */
import { Schema } from 'effect';
import { createItemInputSchema } from '../item/createItemInput';
import { productInputSchema } from './productInput';

/**
 * Mutation payload for creating a product with its items.
 * @since 1.0.0
 */
export type CreateProductWithItemsInput =
  Schema.Schema.Type<typeof createProductWithItemsInputSchema>;

/**
 * Schema for creating a product along with its items.
 * @since 1.0.0
 */
export const createProductWithItemsInputSchema = Schema.Struct({
  product: productInputSchema,
  items: Schema.Array(createItemInputSchema),
});
