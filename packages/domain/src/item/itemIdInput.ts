/**
 * Item identifier input module.
 * @since 1.0.0
 */
import { Schema } from 'effect';
import { itemIdSchema } from './itemId.js';

// GraphQL arg-shape: { id }
/**
 * GraphQL input for selecting an item by id.
 * @since 1.0.0
 */
export type ItemIdInput = Schema.Schema.Type<typeof itemIdInputSchema>;
/**
 * Input schema for selecting an item by id.
 * @since 1.0.0
 */
export const itemIdInputSchema = Schema.Struct({
  id: itemIdSchema,
}).annotations({
  title: 'ItemIdInput',
  description: 'input containing an item identifier',
});

