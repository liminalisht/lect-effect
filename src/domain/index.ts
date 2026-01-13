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
export * from './hello/greeting';

/** @since 1.0.0 */
export * from './hello/helloResponse';

/** @since 1.0.0 */
export * from './hello/name';

/** @since 1.0.0 */
export * from '../config/app/port';

/** @since 1.0.0 */
export * from './product/product';

/** @since 1.0.0 */
export * from './item/item';

// todo: cleanup. maybe consolidate with product.ts
/** @since 1.0.0 */
export type CreateProductWithItemsInput = CreateProductWithItemsInput_;

/** @since 1.0.0 */
export const createProductWithItemsInputSchema = createProductWithItemsInputSchema_;

/** @since 1.0.0 */
export type ProductWithItems = ProductWithItems_;

/** @since 1.0.0 */
export const productWithItemsSchema = productWithItemsSchema_;
