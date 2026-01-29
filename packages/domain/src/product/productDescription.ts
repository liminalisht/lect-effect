/**
 * Product description value object definitions.
 * @since 0.1.0
 */
import { Schema } from 'effect';

/**
 * Product description value object.
 * @since 0.1.0
 * @category Domain Types
 */
export type ProductDescription = Schema.Schema.Type<typeof productDescriptionSchema>;

/**
 * Schema for product descriptions.
 * @since 0.1.0
 * @category Domain Schemas
 */
export const productDescriptionSchema = Schema.String.annotations({ description: 'product description' });
