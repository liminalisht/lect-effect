/**
 * Product domain composite that bundles a product with its items.
 * @since 1.0.0
 */
import { Schema } from 'effect';
import { itemInputSchema, itemSchema } from './item';
import { productInputSchema, productSchema } from './product';

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
  items: Schema.Array(itemInputSchema),
});

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

/**
 * Re-exported product id input schema to preserve import paths.
 * @since 1.0.0
 */

export {productIdInputSchema} from './product';
