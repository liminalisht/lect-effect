/**
 * Item creation/update input module.
 * @since 1.0.0
 */
import { Schema } from 'effect';
import { itemDescriptionSchema } from './itemDescription.js';
import { packSizeSchema } from './packSize.js';

// GraphQL arg-shape: { description?, pack_size }
/**
 * GraphQL input for creating or updating an item.
 * @since 1.0.0
 * @category Domain Types
 */
export type CreateItemInput = Schema.Schema.Type<typeof createItemInputSchema>;
/**
 * Input schema for creating or updating an item.
 * @since 1.0.0
 * @category Domain Schemas
 */
export const createItemInputSchema = Schema.Struct({
  description: Schema.optional(itemDescriptionSchema).annotations({ description: 'item description (nullable & optional)' }),
  pack_size: packSizeSchema,
}).annotations({
  title: 'CreateItemInput',
  description: 'input for creating an item',
});

