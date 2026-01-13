import { Schema } from 'effect';

/**
 * Product identifier.
 * @since 1.0.0
 */
export type ProductId = Schema.Schema.Type<typeof productIdSchema>;
/**
 * Schema for product identifiers.
 * @since 1.0.0
 */
export const productIdSchema = Schema.Number.pipe(Schema.int()).annotations({ description: 'product identifier' });

