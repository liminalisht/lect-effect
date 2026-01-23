/**
 * Product composite (product plus items) module.
 * @since 1.0.0
 */
import { Schema } from 'effect';
import { itemSchema } from '../item/item.js';
import { productSchema } from './product.js';

/**
 * Product paired with its items.
 * @since 1.0.0
 * @category Domain Types
 */
export type ProductWithItems = Schema.Schema.Type<typeof productWithItemsSchema>;
/**
 * Schema representing a product with its items.
 * @since 1.0.0
 * @category Domain Schemas
 */
export const productWithItemsSchema = Schema.Struct({
  product: productSchema,
  items: Schema.Array(itemSchema),
});
