/**
 * Domain module barrel exports.
 * @since 1.0.0
 */
import type {
  CreateProductWithItemsInput as CreateProductWithItemsInput_,
  ProductWithItems as ProductWithItems_,
} from './productWithItems';
import {
  createProductWithItemsInputSchema as createProductWithItemsInputSchema_,
  productWithItemsSchema as productWithItemsSchema_,
} from './productWithItems';

/** @since 1.0.0 */
export * from '../config/app/environment';

/** @since 1.0.0 */
export * from './greeting';

/** @since 1.0.0 */
export * from './helloResponse';

/** @since 1.0.0 */
export * from './name';

/** @since 1.0.0 */
export * from './nameInput';

/** @since 1.0.0 */
export * from '../config/app/port';

/** @since 1.0.0 */
export * from './product';

/** @since 1.0.0 */
export * from './item';

// todo: cleanup. maybe consolidate with product.ts
/** @since 1.0.0 */
export type CreateProductWithItemsInput = CreateProductWithItemsInput_;

/** @since 1.0.0 */
export const createProductWithItemsInputSchema = createProductWithItemsInputSchema_;

/** @since 1.0.0 */
export type ProductWithItems = ProductWithItems_;

/** @since 1.0.0 */
export const productWithItemsSchema = productWithItemsSchema_;
