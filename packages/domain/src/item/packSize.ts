/**
 * Item pack size value object definitions.
 * @since 0.1.0
 */
import { Schema } from 'effect';

/**
 * Pack size value object.
 * @since 0.1.0
 * @category Domain Types
 */
export type PackSize = Schema.Schema.Type<typeof packSizeSchema>;

// todo: add non-negative constraint, greater than 0
/**
 * Schema for item pack size.
 * @since 0.1.0
 * @category Domain Schemas
 */
export const packSizeSchema = Schema.Number.pipe(Schema.int()).annotations({
  description: 'item pack size',
});
