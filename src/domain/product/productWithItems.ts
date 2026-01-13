/**
 * Product domain composite that bundles a product with its items.
 * @since 1.0.0
 */
import { Schema } from 'effect';
import { itemSchema } from '../item/item';
import { productSchema } from './product';

/**
 * Product paired with its items.
 * @since 1.0.0
 */
export type ProductWithItems = Schema.Schema.Type<typeof productWithItemsSchema>;
/**
 * Schema representing a product with its items.
 * @since 1.0.0
 */
export const productWithItemsSchema = Schema.Struct({
  product: productSchema,
  items: Schema.Array(itemSchema),
});
