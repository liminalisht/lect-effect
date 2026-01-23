/**
 * Product-with-items creation input module.
 * @since 1.0.0
 */
import { Schema } from 'effect';
import { createItemInputSchema } from '../item/createItemInput.js';
import { productInputSchema } from './productInput.js';

/**
 * Mutation payload for creating a product with its items.
 * @since 1.0.0
 * @category Domain Types
 */
export type CreateProductWithItemsInput =
  Schema.Schema.Type<typeof createProductWithItemsInputSchema>;

/**
 * Schema for creating a product along with its items.
 * @since 1.0.0
 * @category Domain Schemas
 */
export const createProductWithItemsInputSchema = Schema.Struct({
  product: productInputSchema,
  items: Schema.Array(createItemInputSchema),
});
