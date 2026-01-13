import { Schema } from 'effect';

// todo: brand
/**
 * Item identifier.
 * @since 1.0.0
 */
export type ItemId = Schema.Schema.Type<typeof itemIdSchema>;
/**
 * Identifier schema for items.
 * @since 1.0.0
 */
export const itemIdSchema = Schema.Number.pipe(Schema.int()).annotations({ description: 'item identifier' });

