/**
 * Domain module barrel exports.
 * @since 1.0.0
 */

/** @since 1.0.0 */
export * from './environment';

/** @since 1.0.0 */
export * from './greeting';

/** @since 1.0.0 */
export * from './helloResponse';

/** @since 1.0.0 */
export * from './name';

/** @since 1.0.0 */
export * from './nameInput';

/** @since 1.0.0 */
export * from './port';

/** @since 1.0.0 */
export * from './product';

/** @since 1.0.0 */
export * from './item';

// todo: cleanup. maybe consolidate with product.ts
/** @since 1.0.0 */
export {
  type CreateProductWithItemsInput,
  createProductWithItemsInputSchema,
  type ProductWithItems,
  productWithItemsSchema,
} from './productWithItems';
