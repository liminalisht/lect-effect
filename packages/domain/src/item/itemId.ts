/**
 * Item identifier value object definitions.
 * @since 0.1.0
 */
import { Schema } from 'effect';

// todo: brand
/**
 * Item identifier.
 * @since 0.1.0
 * @category Domain Types
 */
export type ItemId = Schema.Schema.Type<typeof itemIdSchema>;
/**
 * Identifier schema for items.
 * @since 0.1.0
 * @category Domain Schemas
 */
export const itemIdSchema = Schema.Number.pipe(Schema.int()).annotations({ description: 'item identifier' });

